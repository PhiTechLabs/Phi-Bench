/**
 * ─────────────────────────────────────────────────────────────
 *  INTERVIEWS API LAYER
 * ─────────────────────────────────────────────────────────────
 *  All calls go through axiosInstance which handles:
 *  - baseURL (http://localhost:5000/api)
 *  - withCredentials (HttpOnly cookie auth)
 *  - Content-Type: application/json
 * ─────────────────────────────────────────────────────────────
 */

import axiosInstance from "./axiosInstance";

// ─── NORMALIZE: MongoDB _id → id for frontend consistency ────────────────────
const normalize = (iv) => {
    if (!iv) return iv;
    return { ...iv, id: iv._id || iv.id };
};

// ─── CREATE INTERVIEW ─────────────────────────────────────────────────────────
// payload: { candidateId, jobId, interviewRound, interviewType,
//            scheduledDate, scheduledTime, duration,
//            meetingLink?, location?, interviewers?, notes?, submissionId? }
export const createInterview = async (payload) => {
    const { data } = await axiosInstance.post("/interviews", payload);
    return normalize(data.interview);
};

// ─── LIST ALL INTERVIEWS ──────────────────────────────────────────────────────
export const listInterviews = async () => {
    const { data } = await axiosInstance.get("/interviews");
    return (data.interviews || []).map(normalize);
};

// ─── LIST UPCOMING INTERVIEWS ────────────────────────────────────────────────
export const listUpcomingInterviews = async () => {
    const { data } = await axiosInstance.get("/interviews/upcoming");
    return (data.interviews || []).map(normalize);
};

// ─── GET INTERVIEWS FOR A SPECIFIC CANDIDATE ──────────────────────────────────
export const getCandidateInterviews = async (candidateId) => {
    const { data } = await axiosInstance.get(`/interviews/candidate/${candidateId}`);
    return (data.interviews || []).map(normalize);
};

// ─── GET INTERVIEWS FOR A SPECIFIC JOB ───────────────────────────────────────
export const getJobInterviews = async (jobId) => {
    const { data } = await axiosInstance.get(`/interviews/job/${jobId}`);
    return (data.interviews || []).map(normalize);
};

// ─── GET SINGLE INTERVIEW ─────────────────────────────────────────────────────
export const getInterview = async (id) => {
    const { data } = await axiosInstance.get(`/interviews/${id}`);
    return normalize(data.interview);
};

// ─── UPDATE INTERVIEW ─────────────────────────────────────────────────────────
export const updateInterview = async (id, patch) => {
    const { data } = await axiosInstance.put(`/interviews/${id}`, patch);
    return normalize(data.interview);
};

// ─── DELETE INTERVIEW ─────────────────────────────────────────────────────────
export const deleteInterview = async (id) => {
    await axiosInstance.delete(`/interviews/${id}`);
    return true;
};

// ─── ADD FEEDBACK ─────────────────────────────────────────────────────────────
// patch: { feedback, rating, status }
export const addFeedback = async (id, patch) => {
    const { data } = await axiosInstance.patch(`/interviews/${id}/feedback`, patch);
    return normalize(data.interview);
};