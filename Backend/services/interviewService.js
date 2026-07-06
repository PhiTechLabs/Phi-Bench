import Interview, { ROUND_TO_STATUS } from "../models/Interview.js";
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

// ─── LIST ALL INTERVIEWS ──────────────────────────────────────────────────────
export const listInterviewsService = async () => {
    return await Interview.find()
        .populate("candidate", "firstName lastName email jobTitle")
        .populate("job", "title client status")
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
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
        .populate("updatedBy", "username")
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
        .populate("updatedBy", "username")
        .sort({ scheduledDate: 1 });
};

// ─── GET SINGLE INTERVIEW ─────────────────────────────────────────────────────
export const getInterviewByIdService = async (id) => {
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

    return interview;
};

// ─── UPDATE INTERVIEW ─────────────────────────────────────────────────────────
export const updateInterviewService = async (id, payload, userId) => {

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

    if (userId) allowedUpdates.updatedBy = userId;

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

// ─── ADD FEEDBACK ─────────────────────────────────────────────────────────────
export const addFeedbackService = async (id, { feedback, rating, status, outcome, notes }, userId) => {
    const interview = await Interview.findByIdAndUpdate(
        id,
        {
            feedback: feedback || "",
            rating:   rating   || null,
            status:   status   || "Completed",
            outcome:  outcome  || null,
        },
        { new: true, runValidators: true }
    );

    if (!interview) {
        const err = new Error("Interview not found");
        err.statusCode = 404;
        throw err;
    }

    if (outcome && interview.submission) {
        await advanceSubmissionStatus(
            interview.submission,
            interview.interviewRound,
            outcome,
            userId,
            notes || ""
        );
        // Sync the candidate's overall status to reflect the outcome
        await syncCandidateStatus(interview.candidate);
    }

    return interview;
};

// ─── GET UPCOMING INTERVIEWS ─────────────────────────
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