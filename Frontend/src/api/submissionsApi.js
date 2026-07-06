import axiosInstance from "./axiosInstance";

const normalize = (s) => {
    if (!s) return s;
    return {
        ...s,
        id:          s._id || s.id,
        submittedBy: s.createdBy?.username || s.createdBy || "",
        createdBy:   s.createdBy?.username || s.createdBy || "",
        updatedBy:   s.updatedBy?.username || s.updatedBy || "",
    };
};

export const createSubmission = async (payload) => {
    const { data } = await axiosInstance.post("/submissions", payload);
    return normalize(data.submission);
};

export const listSubmissions = async () => {
    const { data } = await axiosInstance.get("/submissions");
    return (data.submissions || []).map(normalize);
};

export const getCandidateSubmissions = async (candidateId) => {
    const { data } = await axiosInstance.get(`/submissions/candidate/${candidateId}`);
    return (data.submissions || []).map(normalize);
};

export const getJobSubmissions = async (jobId) => {
    const { data } = await axiosInstance.get(`/submissions/job/${jobId}`);
    return (data.submissions || []).map(normalize);
};

export const getSubmission = async (id) => {
    const { data } = await axiosInstance.get(`/submissions/${id}`);
    return normalize(data.submission);
};

// Update submission: { status?, recruiterNotes?, clientFeedback?, statusNote? }
export const updateSubmission = async (id, patch) => {
    const { data } = await axiosInstance.put(`/submissions/${id}`, patch);
    return normalize(data.submission);
};

// Admin force-status bypass
export const forceSubmissionStatus = async (id, status, note = "") => {
    const { data } = await axiosInstance.patch(`/submissions/${id}/force-status`, { status, note });
    return normalize(data.submission);
};

// Get allowed next statuses for a submission
export const getSubmissionTransitions = async (id) => {
    const { data } = await axiosInstance.get(`/submissions/${id}/transitions`);
    return data; // { currentStatus, allowedTransitions }
};

export const deleteSubmission = async (id) => {
    await axiosInstance.delete(`/submissions/${id}`);
    return true;
};