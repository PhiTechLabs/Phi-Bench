import axiosInstance from "./axiosInstance";

// ─── HELPER: normalize backend response shape ────────────────────────────────
// Backend returns { candidate, ... } or { candidates, count } — extract & normalize.
// Also ensures `id` is always present (alias of `_id`).
const normalize = (c) => {
    if (!c) return c;
    return {
        ...c,
        id: c.id || c._id, // Mongoose virtual gives us `id`, but be defensive
    };
};

const normalizeMany = (arr = []) => arr.map(normalize);

// ─── LIST CANDIDATES ─────────────────────────────────────────────────────────
export const listCandidates = async () => {
    try {
        const { data } = await axiosInstance.get("/candidates");
        return normalizeMany(data.candidates);
    } catch (err) {
        console.error("listCandidates error:", err);
        return [];
    }
};

// ─── LIST BENCH CANDIDATES (filter from full list) ──────────────────────────
// Bench is a filtered view of all candidates where onBench === true.
// For now, filter client-side from the full list — fine for small datasets.
// If candidates grow into the thousands, swap for a backend query param:
//   GET /api/candidates?onBench=true
export const listBenchCandidates = async () => {
    const all = await listCandidates();
    return all.filter((c) => c.onBench === true);
};

// ─── GET SINGLE CANDIDATE ────────────────────────────────────────────────────
export const getCandidate = async (id) => {
    try {
        const { data } = await axiosInstance.get(`/candidates/${id}`);
        return normalize(data.candidate);
    } catch (err) {
        console.error("getCandidate error:", err);
        return null;
    }
};

// ─── CREATE CANDIDATE ────────────────────────────────────────────────────────
// Form sends `attachments` as { resume: File, ... } — File objects can't be
// JSON-serialized, so we strip them here. Phase 2 (Cloudinary) will handle
// uploads separately and POST URLs back.
export const createCandidate = async (formData) => {
    const payload = sanitizeForBackend(formData);

    try {
        const { data } = await axiosInstance.post("/candidates", payload);
        return normalize(data.candidate);
    } catch (err) {
        const serverMsg =
            err.response?.data?.errors?.[0]?.message ||
            err.response?.data?.message ||
            err.message ||
            "Failed to create candidate";
        alert(`Error: ${serverMsg}`);
        throw err;
    }
};

// ─── UPDATE CANDIDATE (partial) ──────────────────────────────────────────────
export const updateCandidate = async (id, payload) => {
    try {
        const clean = sanitizeForBackend(payload);
        const { data } = await axiosInstance.put(`/candidates/${id}`, clean);
        return normalize(data.candidate);
    } catch (err) {
        const serverMsg =
            err.response?.data?.errors?.[0]?.message ||
            err.response?.data?.message ||
            err.message ||
            "Failed to update candidate";
        alert(`Error: ${serverMsg}`);
        throw err;
    }
};

// ─── DELETE CANDIDATE ────────────────────────────────────────────────────────
export const deleteCandidate = async (id) => {
    try {
        const { data } = await axiosInstance.delete(`/candidates/${id}`);
        return data;
    } catch (err) {
        console.error("deleteCandidate error:", err);
        alert("Failed to delete candidate");
        throw err;
    }
};

// ─── TOGGLE BENCH (dedicated action) ─────────────────────────────────────────
export const toggleBench = async (id) => {
    try {
        const { data } = await axiosInstance.patch(`/candidates/${id}/toggle-bench`);
        return normalize(data.candidate);
    } catch (err) {
        console.error("toggleBench error:", err);
        alert("Failed to toggle bench status");
        throw err;
    }
};

// ─── LEGACY: migrateExistingCandidates (no-op now) ──────────────────────────
// Old localStorage version migrated stale data on app load. Backend handles
// persistence now, so this is a no-op. Kept as an exported function so the
// import in Candidates.jsx doesn't break.
export const migrateExistingCandidates = () => {
    // intentionally empty — was localStorage migration, no longer needed
};

// ─── INTERNAL: strip non-serializable fields before sending to backend ──────
// The CandidateForm collects File objects in `attachments` — these can't be
// JSON-stringified. We drop them here; Phase 2 will handle file uploads via
// a separate FormData/multipart endpoint.
const sanitizeForBackend = (data) => {
    if (!data) return {};
    const { attachments, ...rest } = data;
    return rest;
};