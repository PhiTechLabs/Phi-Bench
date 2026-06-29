import mongoose from "mongoose";

// ─── COUNTER ──────────────────────────────────────────────────────────────────
// One document per entity type ("job", "candidate", "client"), holding the
// last number issued for that type's reference code (JC001, CD001, CL001...).
//
// Why a separate collection instead of counting existing documents: counting
// rows (Job.countDocuments()) is not safe under concurrent creates — two
// requests could both read the same count and both produce JC014. This
// collection is updated with a single atomic $inc (see generateCode.js),
// which MongoDB guarantees is race-free even when many requests land at the
// same instant. It also means codes never get reused or skipped if a record
// is later deleted.
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g. "job", "candidate", "client"
    seq: { type: Number, default: 0 },
});

export default mongoose.model("Counter", counterSchema);