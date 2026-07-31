import Interview, { ROUND_TO_STATUS } from "../models/Interview.js";
import { buildScopeFilter } from "../utils/permissionScope.js";
import Submission from "../models/Submission.js";
import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";
import { syncCandidateStatus } from "../utils/candidateStatusSync.js";

// ─── HELPER: advance submission status after interview action ─────────────────
const advanceSubmissionStatus = async (submissionId, interviewRound, outcome, userId, note = "") => {
    if (!submissionId) return;

    const roundMap = ROUND_TO_STATUS[interviewRound];
    if (!roundMap) return;

    let newStatus;
    switch (outcome) {
        case "Done":
            newStatus = roundMap.feedbackPending;
            break;
        case "Cleared":
            newStatus = roundMap.nextPending;
            break;
        case "Selected":
            newStatus = "Final Select";
            break;
        case "Rejected":
            newStatus = roundMap.rejected;
            break;
        case "Backout":
            newStatus = roundMap.backout;
            break;
        case "No Show":
            // Candidate didn't show — go straight back to schedule pending
            // (no interview happened, so "Rescheduled" isn't the right term)
            newStatus = roundMap.schedulePending;
            break;
        case "Client Reschedule":
        case "Candidate Reschedule":
            // An interview WAS scheduled but rescheduled — use Lx Rescheduled
            // to distinguish from a fresh schedule. This is the ONLY path that
            // sets Lx Rescheduled; without it these statuses are unreachable.
            newStatus = roundMap.rescheduled;
            break;
        default:
            return;
    }

    if (!newStatus) return;

    await Submission.findByIdAndUpdate(submissionId, {
        $set:  { status: newStatus },
        $push: {
            statusHistory: {
                status:    newStatus,
                changedAt: new Date(),
                changedBy: userId,
                note:      note || `Auto-updated from interview outcome: ${outcome}`,
            },
        },
    });
};

// ─── HELPER: check if a record is in scope (non-throwing) ────────────────────
// Used to compute canEdit/canDelete flags for the frontend so it can hide
// action buttons (e.g. the Feedback button) that would fail anyway, instead
// of only finding out after clicking Save.
const isInterviewInScope = async (currentUser, action, interview) => {
    const scopeFilter = await buildScopeFilter(currentUser, "interview", action);

    // "none"/unconfigured permission for this action — never allowed
    if (scopeFilter === false) return false;

    // "all" scope — always allowed
    if (scopeFilter === null) return true;

    const allowedIds = scopeFilter.createdBy.$in.map((id) => id.toString());

    // interview.createdBy may be a populated sub-document ({ _id, username })
    // or a bare ObjectId, depending on which service function fetched it.
    const ownerId = (interview.createdBy?._id ?? interview.createdBy)?.toString();

    return !!ownerId && allowedIds.includes(ownerId);
};

// ─── HELPER: enforce record-level scope (throwing) ────────────────────────────
// requirePermission (route middleware) only checks that the permission value
// isn't "none" — it has no idea which record is being touched. This compares
// a SPECIFIC interview's createdBy against the caller's resolved scope
// (own / team / hierarchy / all) for a given action.
const ensureInterviewInScope = async (currentUser, action, interview) => {
    const inScope = await isInterviewInScope(currentUser, action, interview);
    if (!inScope) {
        const err = new Error("You do not have permission to modify this record");
        err.statusCode = 403;
        throw err;
    }
};

// ─── CREATE INTERVIEW ─────────────────────────────────────────────────────────
export const createInterviewService = async (payload, userId) => {

    const {
        candidateId,
        jobId,
        submissionId,
        interviewRound,
        interviewType,
        scheduledDate,
        scheduledTime,
        duration,
        meetingLink,
        location,
        interviewers,
        notes,
    } = payload;

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

    // ─── SUBMISSION REQUIRED ──────────────────────────────────────────────────
    // An interview without a submission has no ATS context — it can't be
    // tracked against a client, can't advance the pipeline, and can't generate
    // meaningful reports. Every interview MUST be linked to an active submission.
    if (!submissionId) {
        const err = new Error(
            "A submission is required before scheduling an interview. Submit the candidate to a job opening first."
        );
        err.statusCode = 400;
        throw err;
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
        const err = new Error("Submission not found");
        err.statusCode = 404;
        throw err;
    }

    // Prevent scheduling interviews on closed/rejected submissions
    const TERMINAL_STATUSES = new Set([
        "Internal Reject", "Screen Reject", "Duplicate",
        "L1 Rejected", "L2 Rejected", "L3 Rejected", "L4 Rejected",
        "Offer Rejected", "Offer Withdrawn", "Final Backout",
        "BGV Failed", "Joining Backout", "Absconded",
        "Replacement Term Ended", "Project Completed", "Project Ended",
        "Joined", "Position Closed",
    ]);
    if (TERMINAL_STATUSES.has(submission.status)) {
        const err = new Error(
            `Cannot schedule an interview — this submission is already in a terminal status ("${submission.status}").`
        );
        err.statusCode = 400;
        throw err;
    }
    const activeInterview = await Interview.findOne({
        candidate: candidateId,
        job:       jobId,
        status:    { $in: ["Scheduled", "Rescheduled"] },
        outcome:   null,
    });

    if (activeInterview) {
        const err = new Error(
            `An ${activeInterview.interviewRound} interview is already scheduled for this candidate. Submit feedback for the existing interview before scheduling a new one.`
        );
        err.statusCode = 400;
        throw err;
    }

    const round = interviewRound || "L1";

    const interview = await Interview.create({
        candidate:      candidateId,
        job:            jobId,
        submission:     submissionId,
        candidateName:  candidate.name || `${candidate.firstName} ${candidate.lastName}`.trim(),
        jobTitle:       job.title,
        clientName:     job.client,
        interviewRound: round,
        interviewType:  interviewType || "Virtual",
        scheduledDate:  new Date(scheduledDate),
        scheduledTime:  scheduledTime || "",
        duration:       duration || 60,
        meetingLink:    meetingLink || "",
        location:       location || "",
        interviewers:   interviewers || [],
        notes:          notes || "",
        status:         "Scheduled",
        createdBy:      userId,
    });

    // Auto-advance submission to "Lx Scheduled"
    if (submissionId && ROUND_TO_STATUS[round]) {
        const scheduledStatus = ROUND_TO_STATUS[round].scheduled;
        await Submission.findByIdAndUpdate(submissionId, {
            $set:  { status: scheduledStatus },
            $push: {
                statusHistory: {
                    status:    scheduledStatus,
                    changedAt: new Date(),
                    changedBy: userId,
                    note:      `${round} interview scheduled`,
                },
            },
        });
        // Sync the candidate's overall status to reflect the schedule
        await syncCandidateStatus(candidateId);
    }

    return interview;
};

// ─── LIST ALL INTERVIEWS (scoped) ────────────────────────────────────────────
export const listInterviewsService = async (currentUser) => {
    const scopeFilter = await buildScopeFilter(currentUser, "interview", "view");
    if (scopeFilter === false) return [];
    const query = scopeFilter ?? {};
    const interviews = await Interview.find(query)
        .populate("candidate", "firstName lastName email jobTitle")
        .populate("job", "title client status")
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
        .sort({ scheduledDate: 1 });

    return Promise.all(interviews.map(async (iv) => {
        const [canEdit, canDelete] = await Promise.all([
            isInterviewInScope(currentUser, "edit", iv),
            isInterviewInScope(currentUser, "delete", iv),
        ]);
        const ivObj = iv.toObject();
        ivObj._permissions = { canEdit, canDelete };
        return ivObj;
    }));
};

// ─── GET ALL INTERVIEWS FOR A CANDIDATE (scoped) ─────────────────────────────
// Previously had no scope check at all — any authenticated user with a
// non-"none" view permission could see EVERY interview for any candidate,
// regardless of "own"/"team"/"hierarchy" scoping (scoping only applied to
// the standalone list endpoint). Also attaches per-row `_permissions.canEdit`
// so the frontend's Feedback button can be hidden appropriately.
export const getCandidateInterviewsService = async (candidateId, currentUser) => {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
        const err = new Error("Candidate not found");
        err.statusCode = 404;
        throw err;
    }

    const scopeFilter = await buildScopeFilter(currentUser, "interview", "view");
    if (scopeFilter === false) return [];
    const query = { candidate: candidateId, ...(scopeFilter ?? {}) };

    const interviews = await Interview.find(query)
        .populate("job", "title client status")
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
        .sort({ scheduledDate: -1 });

    return Promise.all(interviews.map(async (iv) => {
        const canEdit = await isInterviewInScope(currentUser, "edit", iv);
        const ivObj = iv.toObject();
        ivObj._permissions = { canEdit };
        return ivObj;
    }));
};

// ─── GET ALL INTERVIEWS FOR A JOB (scoped) ───────────────────────────────────
export const getJobInterviewsService = async (jobId, currentUser) => {
    const job = await Job.findById(jobId);
    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }

    const scopeFilter = await buildScopeFilter(currentUser, "interview", "view");
    if (scopeFilter === false) return [];
    const query = { job: jobId, ...(scopeFilter ?? {}) };

    const interviews = await Interview.find(query)
        .populate("candidate", "firstName lastName email jobTitle")
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
        .sort({ scheduledDate: 1 });

    return Promise.all(interviews.map(async (iv) => {
        const canEdit = await isInterviewInScope(currentUser, "edit", iv);
        const ivObj = iv.toObject();
        ivObj._permissions = { canEdit };
        return ivObj;
    }));
};

// ─── GET SINGLE INTERVIEW (scoped) ───────────────────────────────────────────
// Previously had no scope check at all — any authenticated user with a
// non-"none" view permission could fetch ANY interview by id.
// Also attaches `_permissions` so the frontend can hide Edit/Delete/Feedback
// buttons for records the user can view but not modify.
export const getInterviewByIdService = async (id, currentUser) => {
    const interview = await Interview.findById(id)
        .populate("candidate", "firstName lastName email phone jobTitle")
        .populate("job", "title client status")
        .populate("submission")
        .populate("createdBy", "username")
        .populate("updatedBy", "username");

    if (!interview) {
        const err = new Error("Interview not found");
        err.statusCode = 404;
        throw err;
    }

    await ensureInterviewInScope(currentUser, "view", interview);

    const [canEdit, canDelete] = await Promise.all([
        isInterviewInScope(currentUser, "edit", interview),
        isInterviewInScope(currentUser, "delete", interview),
    ]);

    const interviewObj = interview.toObject();
    interviewObj._permissions = { canEdit, canDelete };

    return interviewObj;
};

// ─── UPDATE INTERVIEW (scoped) ────────────────────────────────────────────────
export const updateInterviewService = async (id, payload, currentUser) => {

    const existingInterview = await Interview.findById(id);
    if (!existingInterview) {
        const err = new Error("Interview not found");
        err.statusCode = 404;
        throw err;
    }

    // Enforce edit scope BEFORE applying any changes — this is the check
    // that was missing entirely, which let a scoped "edit" permission
    // (e.g. team-only) update any interview system-wide.
    await ensureInterviewInScope(currentUser, "edit", existingInterview);

    const allowedUpdates = {
        interviewRound: payload.interviewRound,
        interviewType:  payload.interviewType,
        scheduledDate:  payload.scheduledDate ? new Date(payload.scheduledDate) : undefined,
        scheduledTime:  payload.scheduledTime,
        duration:       payload.duration,
        meetingLink:    payload.meetingLink,
        location:       payload.location,
        interviewers:   payload.interviewers,
        status:         payload.status,
        feedback:       payload.feedback,
        rating:         payload.rating,
        notes:          payload.notes,
    };

    Object.keys(allowedUpdates).forEach(
        (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    allowedUpdates.updatedBy = currentUser._id;

    const interview = await Interview.findByIdAndUpdate(id, allowedUpdates, {
        new: true,
        runValidators: true,
    });

    return interview;
};

// ─── ADD FEEDBACK (scoped) ────────────────────────────────────────────────────
// This is functionally an edit action (it changes feedback/rating/status on
// the interview record), and it drives the submission pipeline forward — so
// it needs the exact same edit-scope enforcement as updateInterviewService.
export const addFeedbackService = async (id, { feedback, rating, status, outcome, notes }, currentUser) => {
    const existingInterview = await Interview.findById(id);
    if (!existingInterview) {
        const err = new Error("Interview not found");
        err.statusCode = 404;
        throw err;
    }

    await ensureInterviewInScope(currentUser, "edit", existingInterview);

    const interview = await Interview.findByIdAndUpdate(
        id,
        {
            feedback:  feedback || "",
            rating:    rating   || null,
            status:    status   || "Completed",
            outcome:   outcome  || null,
            updatedBy: currentUser._id,
        },
        { new: true, runValidators: true }
    );

    if (outcome && interview.submission) {
        await advanceSubmissionStatus(
            interview.submission,
            interview.interviewRound,
            outcome,
            currentUser._id,
            notes || ""
        );
        // Sync the candidate's overall status to reflect the outcome
        await syncCandidateStatus(interview.candidate);
    }

    return interview;
};

// ─── GET UPCOMING INTERVIEWS ─────────────────────────
// NOTE: this query uses field names (interviewDate, candidateId, jobId) that
// don't match the actual schema (scheduledDate, candidate, job) — pre-existing
// bug unrelated to permissions, left as-is unless you want it fixed too.
export const getUpcomingInterviewsService = async () => {

    const now = new Date();

    return await Interview.find({
        interviewDate: {
            $gte: now,
        },
    })
        .sort({ interviewDate: 1 })
        .limit(5)
        .populate("candidateId")
        .populate("jobId");
};

// ─── DELETE INTERVIEW (scoped) ────────────────────────────────────────────────
export const deleteInterviewService = async (id, currentUser) => {
    const interview = await Interview.findById(id);
    if (!interview) {
        const err = new Error("Interview not found");
        err.statusCode = 404;
        throw err;
    }

    await ensureInterviewInScope(currentUser, "delete", interview);

    await Interview.findByIdAndDelete(id);

    return interview;
};