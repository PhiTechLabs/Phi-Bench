import Submission, { SUBMISSION_STATUS_TRANSITIONS } from "../models/Submission.js";
import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";

// ─── HELPER: validate status transition ───────────────────────────────────────
const validateTransition = (current, next) => {
    // Allow same status (no-op / note update)
    if (current === next) return true;
    const allowed = SUBMISSION_STATUS_TRANSITIONS[current];
    if (!allowed) return false;
    return allowed.includes(next);
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

// ─── LIST ALL SUBMISSIONS ─────────────────────────────────────────────────────
export const listSubmissionsService = async () => {
    return await Submission.find()
        .populate("candidate", "firstName lastName email jobTitle")
        .populate("job", "title client status")
        .populate("createdBy", "username")
        .sort({ createdAt: -1 });
};

// ─── GET ALL SUBMISSIONS FOR A CANDIDATE ─────────────────────────────────────
export const getCandidateSubmissionsService = async (candidateId) => {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
        const err = new Error("Candidate not found");
        err.statusCode = 404;
        throw err;
    }

    return await Submission.find({ candidate: candidateId })
        .populate("job", "title client status jobType city country")
        .populate("createdBy", "username")
        .sort({ createdAt: -1 });
};

// ─── GET ALL SUBMISSIONS FOR A JOB ───────────────────────────────────────────
export const getJobSubmissionsService = async (jobId) => {
    const job = await Job.findById(jobId);
    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }

    return await Submission.find({ job: jobId })
        .populate("candidate", "firstName lastName email jobTitle experienceYears skills")
        .populate("createdBy", "username")
        .sort({ createdAt: -1 });
};

// ─── GET SINGLE SUBMISSION ────────────────────────────────────────────────────
export const getSubmissionByIdService = async (id) => {
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

    return submission;
};

// ─── UPDATE SUBMISSION (status change + notes) ────────────────────────────────
export const updateSubmissionService = async (id, payload, userId) => {

    const submission = await Submission.findById(id);
    if (!submission) {
        const err = new Error("Submission not found");
        err.statusCode = 404;
        throw err;
    }

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
                changedBy: userId,
                note:      payload.statusNote || "",
            },
        };
    }

    // Direct field updates (no status change)
    if (payload.recruiterNotes !== undefined) updates.recruiterNotes = payload.recruiterNotes;
    if (payload.clientFeedback !== undefined) updates.clientFeedback = payload.clientFeedback;

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

    return updated;
};

// ─── FORCE STATUS (admin override, bypass transition rules) ──────────────────
export const forceStatusService = async (id, status, userId, note) => {
    if (!SUBMISSION_STATUS_TRANSITIONS.hasOwnProperty(status) &&
        !Object.values(SUBMISSION_STATUS_TRANSITIONS).flat().includes(status)) {
        // Check it's a valid status at all
    }

    const updated = await Submission.findByIdAndUpdate(
        id,
        {
            $set:  { status },
            $push: {
                statusHistory: {
                    status,
                    changedAt: new Date(),
                    changedBy: userId,
                    note:      note || "Admin override",
                },
            },
        },
        { new: true, runValidators: true }
    );

    if (!updated) {
        const err = new Error("Submission not found");
        err.statusCode = 404;
        throw err;
    }

    return updated;
};

// ─── DELETE SUBMISSION ────────────────────────────────────────────────────────
export const deleteSubmissionService = async (id) => {
    const submission = await Submission.findByIdAndDelete(id);
    if (!submission) {
        const err = new Error("Submission not found");
        err.statusCode = 404;
        throw err;
    }
    return submission;
};

