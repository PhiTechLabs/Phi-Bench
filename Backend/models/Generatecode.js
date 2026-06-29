import Counter from "../models/Counter.js";

// ─── CODE PREFIXES ─────────────────────────────────────────────────────────────
// Keep this map as the single source of truth for which prefix belongs to
// which entity, so the preview endpoint and the actual creation path can
// never drift apart.
export const CODE_PREFIXES = {
    job: "JC",
    candidate: "CD",
    client: "CL",
};

// Codes start at 3 digits (JC001) and grow naturally past 999 (JC1000) rather
// than wrapping or breaking — padStart just stops adding zeros once the
// number itself is already 3+ digits wide.
const pad = (n) => String(n).padStart(3, "0");

// ─── GENERATE NEXT CODE (mutates the counter — call this exactly once per
// actual creation, never for previews) ────────────────────────────────────────
// Atomically increments the counter for `entityType` and returns the new
// code, e.g. generateNextCode("candidate") -> "CD014". The $inc + upsert in
// a single findOneAndUpdate call is what makes this safe under concurrent
// requests — MongoDB serializes the increment at the document level, so two
// simultaneous candidate creations can never receive the same number.
export const generateNextCode = async (entityType) => {
    const prefix = CODE_PREFIXES[entityType];
    if (!prefix) {
        throw new Error(`Unknown entity type for code generation: ${entityType}`);
    }

    const counter = await Counter.findOneAndUpdate(
        { _id: entityType },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    return `${prefix}${pad(counter.seq)}`;
};

// ─── PREVIEW NEXT CODE (read-only — does NOT increment) ───────────────────────
// Used by the "Next code: CD014" preview shown on the create forms. Reads
// the counter without touching it, so opening the form (or opening it
// multiple times, or never submitting) never burns a number. The number
// shown here can still shift if someone else creates a record in the
// meantime — that's expected and harmless; the real code is only assigned
// at actual creation time via generateNextCode.
export const previewNextCode = async (entityType) => {
    const prefix = CODE_PREFIXES[entityType];
    if (!prefix) {
        throw new Error(`Unknown entity type for code generation: ${entityType}`);
    }

    const counter = await Counter.findById(entityType);
    const nextSeq = (counter?.seq || 0) + 1;

    return `${prefix}${pad(nextSeq)}`;
};