import Candidate from "../models/Candidate.js";
import User from "../models/User.js";

// ─── HELPER: build a clean payload (no stray frontend-only fields) ───────────
const sanitizeArrays = (payload) => {
    const clean = { ...payload };
    if (Array.isArray(clean.education)) {
        clean.education = clean.education.map(({ _id, id, ...rest }) => rest);
    }
    if (Array.isArray(clean.experience)) {
        clean.experience = clean.experience.map(({ _id, id, ...rest }) => rest);
    }
    return clean;
};

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const createCandidateService = async (payload, userId) => {
    const data = {
        ...sanitizeArrays(payload),
        // Attachments come from frontend with `File` objects we can't store yet.
        // Reset to empty slots for now; Phase 2 (Cloudinary) will populate.
        attachments: { resume: null, formattedResume: null, other: null },
        createdBy: userId,
    };

    try {
        return await Candidate.create(data);
    } catch (err) {
        if (err.code === 11000) {
            const dupErr = new Error("A candidate with this email already exists");
            dupErr.statusCode = 409;
            throw dupErr;
        }
        throw err;
    }
};

// ─── LIST ────────────────────────────────────────────────────────────────────
export const listCandidatesService = async (userId) => {

    // get logged in user with role
    const user = await User.findById(userId)
        .populate("roleId");

    if (!user || !user.roleId) {
        throw new Error("User or role not found");
    }

    // super admin can see everything
    if (
        user.roleId.permissions.includes("*") ||
        user.roleId.dataScope === "ORGANIZATION"
    ) {
        return Candidate.find()
            .sort({ createdAt: -1 });
    }

    // recruiter -> only own candidates
    if (user.roleId.dataScope === "SELF") {

        return Candidate.find({
            createdBy: userId
        }).sort({ createdAt: -1 });

    }

    // default fallback
    return [];
};

// ─── GET BY ID ───────────────────────────────────────────────────────────────
export const getCandidateByIdService = async (id, userId) => {  // userId added for potential future access control
    const candidate = await Candidate.findById(id)
        .populate("createdBy", "username role");
    if (!candidate) {
        const err = new Error("Candidate not found");
        err.statusCode = 404;
        throw err;
    }
    return candidate;
};

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export const updateCandidateService = async (id, payload) => {
    const updates = sanitizeArrays(payload);

    // Don't allow attachments to be wiped accidentally via a general update call.
    // Attachment updates go through a dedicated endpoint (Phase 2).
    delete updates.attachments;

    try {
        const candidate = await Candidate.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });
        if (!candidate) {
            const err = new Error("Candidate not found");
            err.statusCode = 404;
            throw err;
        }
        return candidate;
    } catch (err) {
        if (err.code === 11000) {
            const dupErr = new Error("Another candidate already uses this email");
            dupErr.statusCode = 409;
            throw dupErr;
        }
        throw err;
    }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────
export const deleteCandidateService = async (id) => {
    const candidate = await Candidate.findByIdAndDelete(id);
    if (!candidate) {
        const err = new Error("Candidate not found");
        err.statusCode = 404;
        throw err;
    }
    return candidate;
};

// ─── TOGGLE BENCH (dedicated action, cleaner than generic update) ────────────
export const toggleBenchService = async (id) => {
    const candidate = await Candidate.findById(id);
    if (!candidate) {
        const err = new Error("Candidate not found");
        err.statusCode = 404;
        throw err;
    }
    candidate.onBench = !candidate.onBench;
    await candidate.save();
    return candidate;
};