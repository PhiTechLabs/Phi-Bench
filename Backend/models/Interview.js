import mongoose from "mongoose";

// ─── INTERVIEW STATUS PIPELINE ────────────────────────────────────────────────
export const INTERVIEW_STATUSES = [
    "Scheduled",
    "Confirmed",
    "Completed",
    "Cancelled",
    "No Show",
    "Rescheduled",
];

// ─── INTERVIEW TYPES ──────────────────────────────────────────────────────────
export const INTERVIEW_TYPES = [
    "Phone Screen",
    "Video Call",
    "In Person",
    "Technical",
    "HR Round",
    "Panel",
    "Final Round",
];

// ─── INTERVIEW ROUNDS ─────────────────────────────────────────────────────────
export const INTERVIEW_ROUNDS = [
    "Round 1",
    "Round 2",
    "Round 3",
    "Round 4",
    "Final Round",
];

// ─── MAIN INTERVIEW SCHEMA ────────────────────────────────────────────────────
const interviewSchema = new mongoose.Schema({

    // Core references
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission",
        default: null,
    },

    // Denormalized for fast reads
    candidateName: { type: String, trim: true, default: "" },
    jobTitle:      { type: String, trim: true, default: "" },
    clientName:    { type: String, trim: true, default: "" },

    // Interview details
    interviewRound: {
        type: String,
        enum: INTERVIEW_ROUNDS,
        default: "Round 1",
    },
    interviewType: {
        type: String,
        enum: INTERVIEW_TYPES,
        default: "Phone Screen",
    },

    // Scheduling
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, trim: true, default: "" }, // e.g. "10:30 AM"
    duration:      { type: Number, default: 60 },             // in minutes

    // Meeting details
    meetingLink:   { type: String, trim: true, default: "" },
    location:      { type: String, trim: true, default: "" },

    // People
    interviewers:  [{ type: String, trim: true }],

    // Pipeline state
    status: {
        type: String,
        enum: INTERVIEW_STATUSES,
        default: "Scheduled",
    },

    // Outcome
    feedback: { type: String, trim: true, default: "" },
    rating:   { type: Number, min: 1, max: 5, default: null },

    // Notes
    notes: { type: String, trim: true, default: "" },

    // Audit
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

}, { timestamps: true });

// ─── INDEXES ──────────────────────────────────────────────────────────────────
interviewSchema.index({ candidate: 1 });
interviewSchema.index({ job: 1 });
interviewSchema.index({ scheduledDate: 1 });

export default mongoose.model("Interview", interviewSchema);