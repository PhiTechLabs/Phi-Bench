import asyncHandler from "express-async-handler";
import {
    createInterviewService,
    listInterviewsService,
    getCandidateInterviewsService,
    getJobInterviewsService,
    getInterviewByIdService,
    updateInterviewService,
    deleteInterviewService,
    addFeedbackService,
    getUpcomingInterviewsService,
} from "../services/interviewService.js";


// ─── CREATE INTERVIEW ─────────────────────────────────────────────────────────
export const createInterview = asyncHandler(async (req, res) => {
    const interview = await createInterviewService(req.body, req.user.id);
    res.status(201).json({
        message: "Interview scheduled successfully",
        interview,
    });
});

// ─── LIST ALL INTERVIEWS ──────────────────────────────────────────────────────
export const listInterviews = asyncHandler(async (req, res) => {
    const interviews = await listInterviewsService();
    res.json({ count: interviews.length, interviews });
});

// ─── GET INTERVIEWS FOR A CANDIDATE ──────────────────────────────────────────
export const getCandidateInterviews = asyncHandler(async (req, res) => {
    const interviews = await getCandidateInterviewsService(req.params.candidateId);
    res.json({ count: interviews.length, interviews });
});

// ─── GET INTERVIEWS FOR A JOB ─────────────────────────────────────────────────
export const getJobInterviews = asyncHandler(async (req, res) => {
    const interviews = await getJobInterviewsService(req.params.jobId);
    res.json({ count: interviews.length, interviews });
});

// ─── GET SINGLE INTERVIEW ─────────────────────────────────────────────────────
export const getInterview = asyncHandler(async (req, res) => {
    const interview = await getInterviewByIdService(req.params.id);
    res.json({ interview });
});

// ─── UPDATE INTERVIEW ─────────────────────────────────────────────────────────
export const updateInterview = asyncHandler(async (req, res) => {
    const interview = await updateInterviewService(req.params.id, req.body);
    res.json({ message: "Interview updated successfully", interview });
});

// ─── DELETE INTERVIEW ─────────────────────────────────────────────────────────
export const deleteInterview = asyncHandler(async (req, res) => {
    await deleteInterviewService(req.params.id);
    res.json({ message: "Interview deleted successfully" });
});

// ─── ADD FEEDBACK ─────────────────────────────────────────────────────────────
export const addFeedback = asyncHandler(async (req, res) => {
    const interview = await addFeedbackService(req.params.id, req.body);
    res.json({ message: "Feedback added successfully", interview });
});
// ─── UPCOMING INTERVIEWS ─────────────────────────────
export const getUpcomingInterviews = asyncHandler(async (req, res) => {

    const interviews = await getUpcomingInterviewsService();

    res.json({
        count: interviews.length,
        interviews,
    });
});