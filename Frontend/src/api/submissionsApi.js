/**
 * ─────────────────────────────────────────────────────────────
 *  SUBMISSIONS API LAYER
 * ─────────────────────────────────────────────────────────────
 *  All calls go through axiosInstance which handles:
 *  - baseURL (http://localhost:5000/api)
 *  - withCredentials (HttpOnly cookie auth)
 *  - Content-Type: application/json
 * ─────────────────────────────────────────────────────────────
 */

import axiosInstance from "./axiosInstance";

// ─── NORMALIZE: MongoDB _id → id for frontend consistency ────────────────────
const normalize = (s) => {
    if (!s) return s;
    return { ...s, id: s._id || s.id };
};

// ─── CREATE SUBMISSION ────────────────────────────────────────────────────────
// payload: { candidateId, jobId, recruiterNotes? }
export const createSubmission = async (payload) => {
    const { data } = await axiosInstance.post("/submissions", payload);
    return normalize(data.submission);
};

// ─── LIST ALL SUBMISSIONS ─────────────────────────────────────────────────────
export const listSubmissions = async () => {
    const { data } = await axiosInstance.get("/submissions");
    return (data.submissions || []).map(normalize);
};

// ─── GET SUBMISSIONS FOR A SPECIFIC CANDIDATE ─────────────────────────────────
export const getCandidateSubmissions = async (candidateId) => {
    const { data } = await axiosInstance.get(`/submissions/candidate/${candidateId}`);
    return (data.submissions || []).map(normalize);
};

// ─── GET SUBMISSIONS FOR A SPECIFIC JOB ──────────────────────────────────────
export const getJobSubmissions = async (jobId) => {
    const { data } = await axiosInstance.get(`/submissions/job/${jobId}`);
    return (data.submissions || []).map(normalize);
};

// ─── GET SINGLE SUBMISSION ────────────────────────────────────────────────────
export const getSubmission = async (id) => {
    const { data } = await axiosInstance.get(`/submissions/${id}`);
    return normalize(data.submission);
};

// ─── UPDATE SUBMISSION ────────────────────────────────────────────────────────
// patch: { status?, recruiterNotes?, clientFeedback? }
export const updateSubmission = async (id, patch) => {
    const { data } = await axiosInstance.put(`/submissions/${id}`, patch);
    return normalize(data.submission);
};

// ─── DELETE SUBMISSION ────────────────────────────────────────────────────────
export const deleteSubmission = async (id) => {
    await axiosInstance.delete(`/submissions/${id}`);
    return true;
};