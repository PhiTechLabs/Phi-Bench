import Job from "../models/Job.js";

// ─── CREATE JOB ───────────────────────────────────────────────────────────────
export const createJobService = async (payload, userId) => {
    const data = {
        ...payload,
        createdBy: userId,
    };
    return await Job.create(data);
};

// ─── GET ALL JOBS ─────────────────────────────────────────────────────────────
export const getAllJobsService = async () => {
    return await Job.find()
        .populate("createdBy", "username role")
        .sort({ createdAt: -1 });
};

// ─── GET JOB BY ID ────────────────────────────────────────────────────────────
export const getJobByIdService = async (id) => {
    const job = await Job.findById(id)
        .populate("createdBy", "username role");
    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }
    return job;
};

// ─── UPDATE JOB ───────────────────────────────────────────────────────────────
export const updateJobService = async (id, payload) => {
    const job = await Job.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }
    return job;
};

// ─── DELETE JOB ───────────────────────────────────────────────────────────────
export const deleteJobService = async (id) => {
    const job = await Job.findByIdAndDelete(id);
    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }
    return job;
};