import Submission, { SUBMISSION_STATUS_TRANSITIONS } from "../models/Submission.js";
import { buildScopeFilter } from "../utils/permissionScope.js";
import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";
import { syncCandidateStatus } from "../utils/candidateStatusSync.js";

// ─── HELPER: validate status transition ───────────────────────────────────────
const validateTransition = (current, next) => {
    // Allow same status (no-op / note update)
    if (current === next) return true;
    const allowed = SUBMISSION_STATUS_TRANSITIONS[current];
    if (!allowed) return false;
    return allowed.includes(next);
};

// ─── HELPER: check if a record is in scope (non-throwing) ────────────────────
// Used to compute canEdit/canDelete flags for the frontend so it can hide
// action buttons that would fail anyway, instead of only finding out after
// clicking Save/Delete.
const isSubmissionInScope = async (currentUser, action, submission) => {
    const scopeFilter = await buildScopeFilter(currentUser, "submissions", action);

    // "none"/unconfigured permission for this action — never allowed
    if (scopeFilter === false) return false;

    // "all" scope — always allowed
    if (scopeFilter === null) return true;

    const allowedIds = scopeFilter.createdBy.$in.map((id) => id.toString());

    // submission.createdBy may be a populated sub-document ({ _id, username })
    // or a bare ObjectId, depending on which service function fetched it.
    const ownerId = (submission.createdBy?._id ?? submission.createdBy)?.toString();

    return !!ownerId && allowedIds.includes(ownerId);
};

// ─── HELPER: enforce record-level scope (throwing) ────────────────────────────
// requirePermission (route middleware) only checks that the permission value
// isn't "none" — it has no idea which record is being touched. This compares
// a SPECIFIC submission's createdBy against the caller's resolved scope
// (own / team / hierarchy / all) for a given action.
const ensureSubmissionInScope = async (currentUser, action, submission) => {
    const inScope = await isSubmissionInScope(currentUser, action, submission);
    if (!inScope) {
        const err = new Error("You do not have permission to modify this record");
        err.statusCode = 403;
        throw err;
    }
};

// ─── CREATE SUBMISSION ────────────────────────────────────────────────────────
export const createSubmissionService = async (payload, userId) => {

    const { candidateId, jobId, recruiterNotes, status } = payload;

    const [candidate, job] = await Promise.all([
        Candidate.findById(candidateId),
        Job.findById(jobId),
    ]);

    if (!candidate) {
        const err = new Error("Candidate not found");
        err.statusCode = 404;
        throw err;
    }

    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }

    const initialStatus = status || "For Validation";

    try {
        const submission = await Submission.create({
            candidate:      candidateId,
            job:            jobId,
            candidateName:  candidate.name || `${candidate.firstName} ${candidate.lastName}`.trim(),
            jobTitle:       job.title,
            clientName:     job.client,
            status:         initialStatus,
            submittedDate:  new Date(),
            recruiterNotes: recruiterNotes || "",
            createdBy:      userId,
            statusHistory: [{
                status:    initialStatus,
                changedAt: new Date(),
                changedBy: userId,
                note:      "Submission created",
            }],
        });

        // Derive and update the candidate's overall status from all their submissions
        await syncCandidateStatus(candidateId);

        return submission;

    } catch (err) {
        if (err.code === 11000) {
            const dupErr = new Error("This candidate has already been submitted to this job");
            dupErr.statusCode = 409;
            throw dupErr;
        }
        throw err;
    }
};

// ─── LIST ALL SUBMISSIONS (scoped) ──────────────────────────────────────────────
// Also attaches per-row `_permissions` (canEdit, canDelete) so the frontend's
// standalone Submissions table can hide/disable the inline status-changer and
// delete action for rows the user can view but not modify.
export const listSubmissionsService = async (currentUser) => {
    const scopeFilter = await buildScopeFilter(currentUser, "submissions", "view");
    if (scopeFilter === false) return [];
    const query = scopeFilter ?? {};
    const submissions = await Submission.find(query)
        .populate("candidate", "firstName lastName email jobTitle")
        .populate("job", "title client status")
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
        .sort({ createdAt: -1 });

    return Promise.all(submissions.map(async (sub) => {
        const [canEdit, canDelete] = await Promise.all([
            isSubmissionInScope(currentUser, "edit", sub),
            isSubmissionInScope(currentUser, "delete", sub),
        ]);
        const subObj = sub.toObject();
        subObj._permissions = { canEdit, canDelete };
        return subObj;
    }));
};

// ─── GET ALL SUBMISSIONS FOR A CANDIDATE (scoped) ────────────────────────────
// Previously had no scope check at all — any authenticated user with a
// non-"none" view permission could see EVERY submission for any candidate,
// regardless of "own"/"team"/"hierarchy" scoping (scoping only applied to
// the standalone list endpoint).
//
// Also attaches per-row `_permissions.canEdit` so the frontend's "Change"
// status button can be hidden for submissions the user can view but not edit.
export const getCandidateSubmissionsService = async (candidateId, currentUser) => {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
        const err = new Error("Candidate not found");
        err.statusCode = 404;
        throw err;
    }

    const scopeFilter = await buildScopeFilter(currentUser, "submissions", "view");
    if (scopeFilter === false) return [];
    const query = { candidate: candidateId, ...(scopeFilter ?? {}) };

    const submissions = await Submission.find(query)
        .populate("job", "title client status jobType city country")
        .populate("createdBy", "username")
        .populate("statusHistory.changedBy", "username")
        .sort({ createdAt: -1 });

    return Promise.all(submissions.map(async (sub) => {
        const canEdit = await isSubmissionInScope(currentUser, "edit", sub);
        const subObj = sub.toObject();
        subObj._permissions = { canEdit };
        return subObj;
    }));
};

// ─── GET ALL SUBMISSIONS FOR A JOB (scoped) ──────────────────────────────────
export const getJobSubmissionsService = async (jobId, currentUser) => {
    const job = await Job.findById(jobId);
    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }

    const scopeFilter = await buildScopeFilter(currentUser, "submissions", "view");
    if (scopeFilter === false) return [];
    const query = { job: jobId, ...(scopeFilter ?? {}) };

    const submissions = await Submission.find(query)
        .populate("candidate", "firstName lastName email jobTitle experienceYears skills")
        .populate("createdBy", "username")
        .populate("statusHistory.changedBy", "username")
        .sort({ createdAt: -1 });

    return Promise.all(submissions.map(async (sub) => {
        const canEdit = await isSubmissionInScope(currentUser, "edit", sub);
        const subObj = sub.toObject();
        subObj._permissions = { canEdit };
        return subObj;
    }));
};

// ─── GET SINGLE SUBMISSION (scoped) ──────────────────────────────────────────
// Previously had no scope check at all — any authenticated user with a
// non-"none" view permission could fetch ANY submission by id.
// Also attaches `_permissions` so the frontend can hide Edit/Delete buttons
// for records the user can view but not modify.
export const getSubmissionByIdService = async (id, currentUser) => {
    const submission = await Submission.findById(id)
        .populate("candidate", "firstName lastName email phone jobTitle experienceYears skills")
        .populate("job", "title client status jobType city country salary")
        .populate("createdBy", "username")
        .populate("statusHistory.changedBy", "username");

    if (!submission) {
        const err = new Error("Submission not found");
        err.statusCode = 404;
        throw err;
    }

    await ensureSubmissionInScope(currentUser, "view", submission);

    const [canEdit, canDelete] = await Promise.all([
        isSubmissionInScope(currentUser, "edit", submission),
        isSubmissionInScope(currentUser, "delete", submission),
    ]);

    const submissionObj = submission.toObject();
    submissionObj._permissions = { canEdit, canDelete };

    return submissionObj;
};

// ─── UPDATE SUBMISSION (status change + notes) — scoped ──────────────────────
export const updateSubmissionService = async (id, payload, currentUser) => {

    const submission = await Submission.findById(id);
    if (!submission) {
        const err = new Error("Submission not found");
        err.statusCode = 404;
        throw err;
    }

    // Enforce edit scope BEFORE applying any changes — this is the check
    // that was missing entirely, which let a scoped "edit" permission
    // (e.g. team-only) update any submission system-wide.
    await ensureSubmissionInScope(currentUser, "edit", submission);

    const updates = {};

    // Handle status change with transition validation
    if (payload.status && payload.status !== submission.status) {
        if (!validateTransition(submission.status, payload.status)) {
            const err = new Error(
                `Invalid status transition from "${submission.status}" to "${payload.status}"`
            );
            err.statusCode = 422;
            throw err;
        }
        updates.status = payload.status;

        // Append to status history
        updates.$push = {
            statusHistory: {
                status:    payload.status,
                changedAt: new Date(),
                changedBy: currentUser._id,
                note:      payload.statusNote || "",
            },
        };
    }

    // Direct field updates (no status change)
    if (payload.recruiterNotes !== undefined) updates.recruiterNotes = payload.recruiterNotes;
    if (payload.clientFeedback !== undefined) updates.clientFeedback = payload.clientFeedback;

    // Track who last updated this submission
    updates.updatedBy = currentUser._id;

    // If nothing to update
    if (Object.keys(updates).length === 0) return submission;

    // Separate $push from $set to avoid conflict
    const pushOp  = updates.$push;
    delete updates.$push;

    let updateQuery = {};
    if (Object.keys(updates).length > 0) updateQuery.$set = updates;
    if (pushOp) updateQuery.$push = pushOp;

    const updated = await Submission.findByIdAndUpdate(id, updateQuery, {
        new: true,
        runValidators: true,
    });

    // Sync the candidate's overall status to reflect this change
    if (updates.status || updateQuery.$set?.status) {
        await syncCandidateStatus(submission.candidate);
    }

    return updated;
};

// ─── FORCE STATUS (admin override, bypass transition rules) — scoped ─────────
// This bypasses validateTransition on purpose (that's the whole point of a
// force-override), but it must NOT bypass record-level scope — a scoped
// "edit" permission shouldn't be able to force-set status on out-of-scope
// submissions just by hitting this route instead of the normal update route.
export const forceStatusService = async (id, status, currentUser, note) => {
    const submission = await Submission.findById(id);
    if (!submission) {
        const err = new Error("Submission not found");
        err.statusCode = 404;
        throw err;
    }

    await ensureSubmissionInScope(currentUser, "edit", submission);

    const updated = await Submission.findByIdAndUpdate(
        id,
        {
            $set:  { status, updatedBy: currentUser._id },
            $push: {
                statusHistory: {
                    status,
                    changedAt: new Date(),
                    changedBy: currentUser._id,
                    note:      note || "Admin override",
                },
            },
        },
        { new: true, runValidators: true }
    );

    // Sync the candidate's overall status to reflect the forced change
    await syncCandidateStatus(updated.candidate);

    return updated;
};

// ─── DELETE SUBMISSION (scoped) ──────────────────────────────────────────────
export const deleteSubmissionService = async (id, currentUser) => {
    const submission = await Submission.findById(id);
    if (!submission) {
        const err = new Error("Submission not found");
        err.statusCode = 404;
        throw err;
    }

    await ensureSubmissionInScope(currentUser, "delete", submission);

    await Submission.findByIdAndDelete(id);

    return submission;
};