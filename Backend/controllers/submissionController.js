import asyncHandler from "express-async-handler";
import {
    createSubmissionService,
    listSubmissionsService,
    getCandidateSubmissionsService,
    getJobSubmissionsService,
    getSubmissionByIdService,
    updateSubmissionService,
    deleteSubmissionService,
    forceStatusService,
} from "../services/submissionService.js";
import { SUBMISSION_STATUS_TRANSITIONS, SUBMISSION_STATUSES } from "../models/Submission.js";

// ─── CREATE SUBMISSION ────────────────────────────────────────────────────────
export const createSubmission = asyncHandler(async (req, res) => {
    const submission = await createSubmissionService(req.body, req.user.id);
    res.status(201).json({
        message: "Submission created successfully",
        submission,
    });
});

// ─── LIST ALL SUBMISSIONS ─────────────────────────────────────────────────────
export const listSubmissions = asyncHandler(async (req, res) => {
    const submissions = await listSubmissionsService();
    res.json({ count: submissions.length, submissions });
});

// ─── GET SUBMISSIONS FOR A CANDIDATE ─────────────────────────────────────────
export const getCandidateSubmissions = asyncHandler(async (req, res) => {
    const submissions = await getCandidateSubmissionsService(req.params.candidateId);
    res.json({ count: submissions.length, submissions });
});

// ─── GET SUBMISSIONS FOR A JOB ────────────────────────────────────────────────
export const getJobSubmissions = asyncHandler(async (req, res) => {
    const submissions = await getJobSubmissionsService(req.params.jobId);
    res.json({ count: submissions.length, submissions });
});

// ─── GET SINGLE SUBMISSION ────────────────────────────────────────────────────
export const getSubmission = asyncHandler(async (req, res) => {
    const submission = await getSubmissionByIdService(req.params.id);
    res.json({ submission });
});

// ─── UPDATE SUBMISSION (status change + notes) ────────────────────────────────
export const updateSubmission = asyncHandler(async (req, res) => {
    const submission = await updateSubmissionService(req.params.id, req.body, req.user.id);
    res.json({ message: "Submission updated successfully", submission });
});

// ─── FORCE STATUS (admin bypass) ──────────────────────────────────────────────
export const forceStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    if (!status || !SUBMISSION_STATUSES.includes(status)) {
        res.status(400);
        throw new Error("Invalid status value");
    }
    const submission = await forceStatusService(req.params.id, status, req.user.id, note);
    res.json({ message: "Status updated (admin override)", submission });
});

// ─── GET ALLOWED TRANSITIONS ──────────────────────────────────────────────────
export const getAllowedTransitions = asyncHandler(async (req, res) => {
    const submission = await getSubmissionByIdService(req.params.id);
    const allowed = SUBMISSION_STATUS_TRANSITIONS[submission.status] || [];
    res.json({ currentStatus: submission.status, allowedTransitions: allowed });
});

// ─── DELETE SUBMISSION ────────────────────────────────────────────────────────
export const deleteSubmission = asyncHandler(async (req, res) => {
    await deleteSubmissionService(req.params.id);
    res.json({ message: "Submission deleted successfully" });
});