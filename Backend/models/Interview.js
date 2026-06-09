import mongoose from "mongoose";

// ─── INTERVIEW STATUSES ────────────────────────────────────────────────────────
// These are the scheduling/lifecycle statuses of the interview itself
export const INTERVIEW_STATUSES = [
    "Scheduled",
    "Rescheduled",
    "Completed",
    "Cancelled",
    "No Show",
];

// ─── INTERVIEW OUTCOMES ────────────────────────────────────────────────────────
// Outcome is set when providing feedback; drives the next submission status
export const INTERVIEW_OUTCOMES = [
    "Done",           // interview happened, feedback given → triggers next round or final
    "Cleared",        // candidate cleared this round → move to next round
    "Selected",       // candidate selected → Final Select
    "Rejected",       // candidate rejected → Lx Rejected
    "Backout",        // candidate backed out → Lx Backout
    "No Show",        // candidate didn't show → reschedule
    "Client Reschedule",    // client rescheduled → Lx Schedule Pending
    "Candidate Reschedule", // candidate rescheduled → Lx Schedule Pending
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
export const INTERVIEW_ROUNDS = ["L1", "L2", "L3", "L4", "Final"];

// ─── ROUND → SUBMISSION STATUS MAPPING ───────────────────────────────────────
// Maps interview round to the corresponding submission statuses it manages
export const ROUND_TO_STATUS = {
    "L1": {
        scheduled:       "L1 Scheduled",
        feedbackPending: "L1 Feedback Pending",
        rescheduled:     "L1 Rescheduled",
        schedulePending: "L1 Schedule Pending",
        rejected:        "L1 Rejected",
        backout:         "L1 Backout",
        nextPending:     "L2 Schedule Pending",
    },
    "L2": {
        scheduled:       "L2 Scheduled",
        feedbackPending: "L2 Feedback Pending",
        rescheduled:     "L2 Rescheduled",
        schedulePending: "L2 Schedule Pending",
        rejected:        "L2 Rejected",
        backout:         "L2 Backout",
        nextPending:     "L3 Schedule Pending",
    },
    "L3": {
        scheduled:       "L3 Scheduled",
        feedbackPending: "L3 Feedback Pending",
        rescheduled:     "L3 Rescheduled",
        schedulePending: "L3 Schedule Pending",
        rejected:        "L3 Rejected",
        backout:         "L3 Backout",
        nextPending:     "L4 Schedule Pending",
    },
    "L4": {
        scheduled:       "L4 Scheduled",
        feedbackPending: "L4 Feedback Pending",
        rescheduled:     "L4 Rescheduled",
        schedulePending: "L4 Schedule Pending",
        rejected:        "L4 Rejected",
        backout:         "L4 Backout",
        nextPending:     "Final Select",
    },
    "Final": {
        scheduled:       "L4 Scheduled",
        feedbackPending: "L4 Feedback Pending",
        rescheduled:     "L4 Rescheduled",
        schedulePending: "L4 Schedule Pending",
        rejected:        "L4 Rejected",
        backout:         "L4 Backout",
        nextPending:     "Final Select",
    },
};

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
        default: "L1",
    },
    interviewType: {
        type: String,
        enum: INTERVIEW_TYPES,
        default: "Phone Screen",
    },

    // Scheduling
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, trim: true, default: "" },
    duration:      { type: Number, default: 60 },

    // Meeting details
    meetingLink:   { type: String, trim: true, default: "" },
    location:      { type: String, trim: true, default: "" },

    // People
    interviewers:  [{ type: String, trim: true }],

    // Lifecycle status
    status: {
        type: String,
        enum: INTERVIEW_STATUSES,
        default: "Scheduled",
    },

    // Outcome (set when submitting feedback)
    outcome: {
        type: String,
        enum: INTERVIEW_OUTCOMES,
        default: null,
    },

    // Feedback
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
interviewSchema.index({ submission: 1 });
interviewSchema.index({ scheduledDate: 1 });

export default mongoose.model("Interview", interviewSchema);