import axiosInstance from "./axiosInstance";

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE NORMALIZERS
// ─────────────────────────────────────────────────────────────────────────────

// Normalize a single candidate object
const normalize = (candidate) => {

    if (!candidate) return null;

    return {
        ...candidate,

        // always expose stable id
        id: candidate.id || candidate._id,

        // derived name fallback
        name:
            candidate.name ||
            [candidate.firstName, candidate.lastName]
                .filter(Boolean)
                .join(" ")
                .trim(),

        // initials for avatars
        initials:
            candidate.initials ||
            [candidate.firstName?.[0], candidate.lastName?.[0]]
                .filter(Boolean)
                .join("")
                .toUpperCase(),

        // safe defaults
        status: candidate.status || "New",
        onBench: Boolean(candidate.onBench),

        // normalize arrays
        education: Array.isArray(candidate.education)
            ? candidate.education
            : [],

        experience: Array.isArray(candidate.experience)
            ? candidate.experience
            : [],

        attachments: candidate.attachments || {},
    };
};

// Normalize array safely
const normalizeMany = (arr = []) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(normalize);
};

// ─────────────────────────────────────────────────────────────────────────────
// LIST CANDIDATES
// ─────────────────────────────────────────────────────────────────────────────

export const listCandidates = async () => {

    try {

        const response = await axiosInstance.get("/candidates");

        const data = response?.data;

        // support multiple backend response shapes
        const candidates =
            data?.candidates ||
            data?.data ||
            data ||
            [];

        return normalizeMany(candidates);

    } catch (err) {

        console.error("listCandidates error:", err);

        return [];
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// LIST BENCH CANDIDATES
// ─────────────────────────────────────────────────────────────────────────────

export const listBenchCandidates = async () => {

    const allCandidates = await listCandidates();

    return allCandidates.filter(
        (candidate) => candidate.onBench === true
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE CANDIDATE
// ─────────────────────────────────────────────────────────────────────────────

export const getCandidate = async (id) => {

    if (!id) return null;

    try {

        const response = await axiosInstance.get(`/candidates/${id}`);

        const data = response?.data;

        const candidate =
            data?.candidate ||
            data?.data ||
            data;

        return normalize(candidate);

    } catch (err) {

        console.error("getCandidate error:", err);

        return null;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE CANDIDATE
// ─────────────────────────────────────────────────────────────────────────────

export const createCandidate = async (formData) => {

    try {

        const payload = sanitizeForBackend(formData);

        const response = await axiosInstance.post(
            "/candidates",
            payload
        );

        const data = response?.data;

        return normalize(
            data?.candidate ||
            data?.data ||
            data
        );

    } catch (err) {

        console.error("createCandidate error:", err);

        const serverMessage =
            err?.response?.data?.errors?.[0]?.message ||
            err?.response?.data?.message ||
            err?.message ||
            "Failed to create candidate";

        alert(serverMessage);

        throw err;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE CANDIDATE
// ─────────────────────────────────────────────────────────────────────────────

export const updateCandidate = async (id, payload) => {

    if (!id) {
        throw new Error("Candidate id is required");
    }

    try {

        const cleanPayload = sanitizeForBackend(payload);

        const response = await axiosInstance.put(
            `/candidates/${id}`,
            cleanPayload
        );

        const data = response?.data;

        return normalize(
            data?.candidate ||
            data?.data ||
            data
        );

    } catch (err) {

//   console.log("FULL ERROR", err);
//   console.log("RESPONSE", err.response);
//   console.log("DATA", err.response?.data);

//   console.error("updateCandidate error:", err);

//         console.error("updateCandidate error:", err);

        const serverMessage =
            err?.response?.data?.errors?.[0]?.message ||
            err?.response?.data?.message ||
            err?.message ||
            "Failed to update candidate";

        alert(serverMessage);

        throw err;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CANDIDATE
// ─────────────────────────────────────────────────────────────────────────────

export const deleteCandidate = async (id) => {

    if (!id) {
        throw new Error("Candidate id is required");
    }

    try {

        const response = await axiosInstance.delete(
            `/candidates/${id}`
        );

        return response?.data;

    } catch (err) {

        console.error("deleteCandidate error:", err);

        const serverMessage =
            err?.response?.data?.message ||
            "Failed to delete candidate";

        alert(serverMessage);

        throw err;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE BENCH STATUS
// ─────────────────────────────────────────────────────────────────────────────

export const toggleBench = async (id) => {

    if (!id) {
        throw new Error("Candidate id is required");
    }

    try {

        const response = await axiosInstance.patch(
            `/candidates/${id}/toggle-bench`
        );

        const data = response?.data;

        return normalize(
            data?.candidate ||
            data?.data ||
            data
        );

    } catch (err) {

        console.error("toggleBench error:", err);

        const serverMessage =
            err?.response?.data?.message ||
            "Failed to toggle bench status";

        alert(serverMessage);

        throw err;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY MIGRATION (NO-OP)
// ─────────────────────────────────────────────────────────────────────────────

export const migrateExistingCandidates = () => {
    // intentionally empty
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Remove non-serializable File objects before sending JSON
const sanitizeForBackend = (data) => {

    if (!data) return {};

    const cleaned = { ...data };

    // attachments contain File objects
    delete cleaned.attachments;

    // remove undefined fields
    Object.keys(cleaned).forEach((key) => {

        if (
            cleaned[key] === undefined ||
            cleaned[key] === null
        ) {
            delete cleaned[key];
        }
    });

    return cleaned;
};