import asyncHandler from "express-async-handler";
import {
    createJobService,
    getAllJobsService,
    getJobByIdService,
    updateJobService,
    deleteJobService,
} from "../services/jobService.js";

// ─── CREATE JOB ───────────────────────────────────────────────────────────────
export const createJob = asyncHandler(async (req, res) => {
    const job = await createJobService(req.body, req.user.id);
    res.status(201).json({
        message: "Job created successfully",
        job,
    });
});

// ─── GET ALL JOBS ─────────────────────────────────────────────────────────────
export const getAllJobs = asyncHandler(async (req, res) => {
    const jobs = await getAllJobsService();
    res.json({ count: jobs.length, jobs });
});

// ─── GET JOB BY ID ────────────────────────────────────────────────────────────
export const getJobById = asyncHandler(async (req, res) => {
    const job = await getJobByIdService(req.params.id);
    res.json({ job });
});

// ─── UPDATE JOB ───────────────────────────────────────────────────────────────
export const updateJob = asyncHandler(async (req, res) => {
    const job = await updateJobService(req.params.id, req.body);
    res.json({ message: "Job updated successfully", job });
});

// ─── DELETE JOB ───────────────────────────────────────────────────────────────
export const deleteJob = asyncHandler(async (req, res) => {
    await deleteJobService(req.params.id);
    res.json({ message: "Job deleted successfully" });
});