import Submission from "../models/Submission.js";
import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";

// ─── CREATE SUBMISSION ────────────────────────────────────────────────────────
export const createSubmissionService = async (payload, userId) => {

    const { candidateId, jobId, recruiterNotes, status } = payload;

    // Fetch candidate and job to denormalize names
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

    try {
        const submission = await Submission.create({
            candidate:      candidateId,
            job:            jobId,
            candidateName:  candidate.name || `${candidate.firstName} ${candidate.lastName}`.trim(),
            jobTitle:       job.title,
            clientName:     job.client,
            status:         status || "Submitted",
            submittedDate:  new Date(),
            recruiterNotes: recruiterNotes || "",
            createdBy:      userId,
        });

        return submission;

    } catch (err) {
        // Duplicate submission (unique index on candidate + job)
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
        .populate("createdBy", "username");

    if (!submission) {
        const err = new Error("Submission not found");
        err.statusCode = 404;
        throw err;
    }

    return submission;
};

// ─── UPDATE SUBMISSION ────────────────────────────────────────────────────────
export const updateSubmissionService = async (id, payload) => {

    // Only allow safe fields to be updated
    const allowedUpdates = {
        status:         payload.status,
        recruiterNotes: payload.recruiterNotes,
        clientFeedback: payload.clientFeedback,
    };

    // Remove undefined keys
    Object.keys(allowedUpdates).forEach(
        (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    const submission = await Submission.findByIdAndUpdate(id, allowedUpdates, {
        new: true,
        runValidators: true,
    });

    if (!submission) {
        const err = new Error("Submission not found");
        err.statusCode = 404;
        throw err;
    }

    return submission;
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