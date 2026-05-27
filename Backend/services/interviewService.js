import Interview from "../models/Interview.js";
import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";

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

    const interview = await Interview.create({
        candidate:      candidateId,
        job:            jobId,
        submission:     submissionId || null,
        candidateName:  candidate.name || `${candidate.firstName} ${candidate.lastName}`.trim(),
        jobTitle:       job.title,
        clientName:     job.client,
        interviewRound: interviewRound || "Round 1",
        interviewType:  interviewType || "Phone Screen",
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

    return interview;
};

// ─── LIST ALL INTERVIEWS ──────────────────────────────────────────────────────
export const listInterviewsService = async () => {
    return await Interview.find()
        .populate("candidate", "firstName lastName email jobTitle")
        .populate("job", "title client status")
        .populate("createdBy", "username")
        .sort({ scheduledDate: 1 });
};

// ─── GET ALL INTERVIEWS FOR A CANDIDATE ──────────────────────────────────────
export const getCandidateInterviewsService = async (candidateId) => {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
        const err = new Error("Candidate not found");
        err.statusCode = 404;
        throw err;
    }

    return await Interview.find({ candidate: candidateId })
        .populate("job", "title client status")
        .populate("createdBy", "username")
        .sort({ scheduledDate: -1 });
};

// ─── GET ALL INTERVIEWS FOR A JOB ────────────────────────────────────────────
export const getJobInterviewsService = async (jobId) => {
    const job = await Job.findById(jobId);
    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }

    return await Interview.find({ job: jobId })
        .populate("candidate", "firstName lastName email jobTitle")
        .populate("createdBy", "username")
        .sort({ scheduledDate: 1 });
};

// ─── GET SINGLE INTERVIEW ─────────────────────────────────────────────────────
export const getInterviewByIdService = async (id) => {
    const interview = await Interview.findById(id)
        .populate("candidate", "firstName lastName email phone jobTitle")
        .populate("job", "title client status")
        .populate("submission")
        .populate("createdBy", "username");

    if (!interview) {
        const err = new Error("Interview not found");
        err.statusCode = 404;
        throw err;
    }

    return interview;
};

// ─── UPDATE INTERVIEW ─────────────────────────────────────────────────────────
export const updateInterviewService = async (id, payload) => {

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

    // Remove undefined keys
    Object.keys(allowedUpdates).forEach(
        (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    const interview = await Interview.findByIdAndUpdate(id, allowedUpdates, {
        new: true,
        runValidators: true,
    });

    if (!interview) {
        const err = new Error("Interview not found");
        err.statusCode = 404;
        throw err;
    }

    return interview;
};

// ─── DELETE INTERVIEW ─────────────────────────────────────────────────────────
export const deleteInterviewService = async (id) => {
    const interview = await Interview.findByIdAndDelete(id);
    if (!interview) {
        const err = new Error("Interview not found");
        err.statusCode = 404;
        throw err;
    }
    return interview;
};

// ─── ADD FEEDBACK ─────────────────────────────────────────────────────────────
export const addFeedbackService = async (id, { feedback, rating, status }) => {
    const interview = await Interview.findByIdAndUpdate(
        id,
        {
            feedback: feedback || "",
            rating:   rating   || null,
            status:   status   || "Completed",
        },
        { new: true, runValidators: true }
    );

    if (!interview) {
        const err = new Error("Interview not found");
        err.statusCode = 404;
        throw err;
    }

    return interview;
};