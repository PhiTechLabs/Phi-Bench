import axiosInstance from "./axiosInstance";

const normalize = (iv) => {
    if (!iv) return iv;
    return { ...iv, id: iv._id || iv.id };
};

export const createInterview = async (payload) => {
    const { data } = await axiosInstance.post("/interviews", payload);
    return normalize(data.interview);
};

export const listInterviews = async () => {
    const { data } = await axiosInstance.get("/interviews");
    return (data.interviews || []).map(normalize);
};

export const getCandidateInterviews = async (candidateId) => {
    const { data } = await axiosInstance.get(`/interviews/candidate/${candidateId}`);
    return (data.interviews || []).map(normalize);
};

export const getJobInterviews = async (jobId) => {
    const { data } = await axiosInstance.get(`/interviews/job/${jobId}`);
    return (data.interviews || []).map(normalize);
};

export const getInterview = async (id) => {
    const { data } = await axiosInstance.get(`/interviews/${id}`);
    return normalize(data.interview);
};

export const updateInterview = async (id, patch) => {
    const { data } = await axiosInstance.put(`/interviews/${id}`, patch);
    return normalize(data.interview);
};

export const deleteInterview = async (id) => {
    await axiosInstance.delete(`/interviews/${id}`);
    return true;
};

// Add feedback + outcome — auto-advances submission status
// patch: { feedback, rating?, outcome, notes? }
export const addFeedback = async (id, patch) => {
    const { data } = await axiosInstance.patch(`/interviews/${id}/feedback`, patch);
    return normalize(data.interview);
};

// ─── LIST UPCOMING INTERVIEWS (alias for Home.jsx dashboard) ─────────────────
export const listUpcomingInterviews = async () => {
    const { data } = await axiosInstance.get("/interviews");
    const now = new Date();
    return (data.interviews || [])
        .map(normalize)
        .filter((iv) => iv.status === "Scheduled" && new Date(iv.scheduledDate) >= now)
        .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
        .slice(0, 10);
};