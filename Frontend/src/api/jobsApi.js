/**
 * ────────────────────────────────────────────────────────────
 *  JOBS API LAYER
 * ────────────────────────────────────────────────────────────
 *  Single source of truth for all job opening data operations.
 *  Backed by the /api/jobs Express + Mongo backend.
 *
 *  Page components don't need to know about HTTP, headers, or
 *  MongoDB's _id format — this layer handles all of that.
 *
 *  NOTE: axiosInstance already has baseURL set to
 *  "http://localhost:5000/api", so URLs here start with "/jobs".
 * ────────────────────────────────────────────────────────────
 */

import axiosInstance  from "./axiosInstance";

/* ── normalize MongoDB _id → id for frontend consistency ── */
const normalize = (job) => {
    if (!job) return job;
    return { ...job, id: job._id || job.id };
};

/* ── public API ── */

const handleApi = async (cb) => {
    try {
        return await cb();
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const listJobs = async () =>
    handleApi(async () => {
        const { data } = await axiosInstance.get("/jobs");
        return (Array.isArray(data.jobs) ? data.jobs : [] ).map(normalize);
    });

export const getJobById = async (id) =>
    handleApi(async () => {
        const { data } = await axiosInstance.get(`/jobs/${id}`);
        return normalize(data.job);
    });

export const createJob = async (payload) =>
    handleApi(async () => {
        const { data } = await axiosInstance.post("/jobs", payload);
        return normalize(data.job);
    });

export const updateJob = async (id, patch) =>
    handleApi(async () => {
        const { data } = await axiosInstance.put(`/jobs/${id}`, patch);
        return normalize(data.job);
    });

export const deleteJob = async (id) =>
    handleApi(async () => {
        await axiosInstance.delete(`/jobs/${id}`);
        return true;
    });

export const listOpenJobs = async () => {
    const all = await listJobs();
    return all.filter((j) => j.status === "Open");
};