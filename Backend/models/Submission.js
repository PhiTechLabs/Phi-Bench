import mongoose from "mongoose";

// ─── SUBMISSION STATUSES (Ceipal-style staffing pipeline) ─────────────────────
//
// UPPER SECTION (Pre-Interview / Client Facing):
//   For Validation → Internal Hold / Internal Reject / Need More Info / Submitted To Client
//   Submitted To Client → Duplicate / Hold by Client / Screen Reject / Position Closed / L1 Schedule Pending
//   Hold by Client → Submitted To Client / Screen Reject / Position Closed / Duplicate / L1 Schedule Pending
//   Screen Reject → For Validation
//   Position Closed → Screen Reject / Submitted To Client / Duplicate / L1 Schedule Pending
//
// LOWER SECTION (Interview Stage):
//   Lx Schedule Pending → Lx Scheduled (auto when interview scheduled)
//   Lx Scheduled → Lx Feedback Pending / Lx Rescheduled
//   Feedback Pending + outcome=Done → L(x+1) Schedule Pending / Lx Rejected / Lx Backout / Final Select
//   outcome=Backout → Lx Schedule Pending (re-schedule)
//   outcome=No Show / Client Reschedule / Candidate Reschedule → Lx Schedule Pending
//   outcome=Cleared → Next round Schedule Pending (or Final Select if last round)
//   outcome=Rejected → Lx Rejected → Submitted To Client
//   outcome=Selected → Final Select → HR Discussion / Final Backout
//   HR Discussion → Offer Sent / Final Backout
//   Offer Sent → Offer Accepted / BGV Failed / Offer Rejected / Offer Withdrawn
//   Offer Accepted → Joined / BGV Failed / Joining Backout
//   Joined (terminal positive), BGV Failed, Offer Rejected, etc.
//   Post-join: Absconded / Replacement Term Ended / Project Completed / Project Ended

export const SUBMISSION_STATUSES = [
    // ── Pre-Client ──────────────────────────────────────────────────────────
    "For Validation",
    "Internal Hold",
    "Internal Reject",
    "Need More Info",

    // ── Client Facing ────────────────────────────────────────────────────────
    "Submitted To Client",
    "Duplicate",
    "Hold by Client",
    "Screen Reject",
    "Position Closed",

    // ── Interview Scheduling ─────────────────────────────────────────────────
    "L1 Schedule Pending",
    "L1 Scheduled",
    "L1 Feedback Pending",
    "L1 Rescheduled",
    "L1 Rejected",
    "L1 Backout",

    "L2 Schedule Pending",
    "L2 Scheduled",
    "L2 Feedback Pending",
    "L2 Rescheduled",
    "L2 Rejected",
    "L2 Backout",

    "L3 Schedule Pending",
    "L3 Scheduled",
    "L3 Feedback Pending",
    "L3 Rescheduled",
    "L3 Rejected",
    "L3 Backout",

    "L4 Schedule Pending",
    "L4 Scheduled",
    "L4 Feedback Pending",
    "L4 Rescheduled",
    "L4 Rejected",
    "L4 Backout",

    // ── Final Stage ───────────────────────────────────────────────────────────
    "Final Select",
    "HR Discussion",
    "Offer Sent",
    "Final Backout",

    // ── Offer Stage ───────────────────────────────────────────────────────────
    "Offer Accepted",
    "BGV Failed",
    "Offer Rejected",
    "Offer Withdrawn",

    // ── Post-Join ─────────────────────────────────────────────────────────────
    "Joined",
    "Joining Backout",
    "Absconded",
    "Replacement Term Ended",
    "Project Completed",
    "Project Ended",
];

// ─── STATUS TRANSITIONS MAP ──────────────────────────────────────────────────
// Key = current status, Value = array of allowed next statuses
export const SUBMISSION_STATUS_TRANSITIONS = {
    "For Validation": [
        "Internal Hold",
        "Internal Reject",
        "Need More Info",
        "Submitted To Client",
    ],
    "Internal Hold": [
        "For Validation",
        "Submitted To Client",
    ],
    "Internal Reject": [
        "For Validation",
    ],
    "Need More Info": [
        "Internal Hold",
        "For Validation",
        "Internal Reject",
    ],
    "Submitted To Client": [
        "Duplicate",
        "Hold by Client",
        "Screen Reject",
        "Position Closed",
        "L1 Schedule Pending",
    ],
    "Duplicate": [
        "For Validation",
    ],
    "Hold by Client": [
        "Submitted To Client",
        "Screen Reject",
        "Position Closed",
        "Duplicate",
        "L1 Schedule Pending",
        "L2 Schedule Pending",
        "L3 Schedule Pending",
        "L4 Schedule Pending",
    ],
    "Screen Reject": [
        "For Validation",
    ],
    "Position Closed": [
        "Screen Reject",
        "Submitted To Client",
        "Duplicate",
        "L1 Schedule Pending",
    ],
    // ── L1 ──
    "L1 Schedule Pending": [
        "L1 Scheduled",
        "L1 Backout",
        "Hold by Client",
    ],
    "L1 Scheduled": [],
    "L1 Feedback Pending": [
        "L1 Rejected",
        "L1 Backout",
        "L2 Schedule Pending",
        "Final Select",
        "Hold by Client",
    ],
    "L1 Rescheduled": [
        "L1 Schedule Pending",
        "L1 Feedback Pending",
    ],
    "L1 Rejected": [
        "Submitted To Client",
    ],
    "L1 Backout": [
        "L1 Schedule Pending",
        "Hold by Client",
    ],
    // ── L2 ──
    "L2 Schedule Pending": [
        "L2 Scheduled",
        "L2 Backout",
        "Hold by Client",
    ],
    "L2 Scheduled": [],
    "L2 Feedback Pending": [
        "L2 Rejected",
        "L2 Backout",
        "L3 Schedule Pending",
        "Final Select",
        "Hold by Client",
    ],
    "L2 Rescheduled": [
        "L2 Schedule Pending",
        "L2 Feedback Pending",
    ],
    "L2 Rejected": [
        "Submitted To Client",
    ],
    "L2 Backout": [
        "L2 Schedule Pending",
        "Hold by Client",
    ],
    // ── L3 ──
    "L3 Schedule Pending": [
        "L3 Scheduled",
        "L3 Backout",
        "Hold by Client",
    ],
    "L3 Scheduled": [],
    "L3 Feedback Pending": [
        "L3 Rejected",
        "L3 Backout",
        "L4 Schedule Pending",
        "Final Select",
        "Hold by Client",
    ],
    "L3 Rescheduled": [
        "L3 Schedule Pending",
        "L3 Feedback Pending",
    ],
    "L3 Rejected": [
        "Submitted To Client",
    ],
    "L3 Backout": [
        "L3 Schedule Pending",
        "Hold by Client",
    ],
    // ── L4 ──
    "L4 Schedule Pending": [
        "L4 Scheduled",
        "L4 Backout",
        "Hold by Client",
    ],
    "L4 Scheduled": [],
    "L4 Feedback Pending": [
        "L4 Rejected",
        "L4 Backout",
        "Final Select",
        "Hold by Client",
    ],
    "L4 Rescheduled": [
        "L4 Schedule Pending",
        "L4 Feedback Pending",
    ],
    "L4 Rejected": [
        "Submitted To Client",
    ],
    "L4 Backout": [
        "L4 Schedule Pending",
        "Hold by Client",
    ],
    // ── Final Stage ──
    "Final Select": [
        "HR Discussion",
        "Final Backout",
        "Offer Sent",
    ],
    "HR Discussion": [
        "Offer Sent",
        "Final Backout",
    ],
    "Final Backout": [
        "Final Select",
    ],
    "Offer Sent": [
        "Offer Accepted",
        "BGV Failed",
        "Offer Rejected",
        "Offer Withdrawn",
        "HR Discussion",
    ],
    "Offer Accepted": [
        "Joined",
        "BGV Failed",
        "Joining Backout",
    ],
    // ── Post-Join ──
    "Joined": [
        "Absconded",
        "Replacement Term Ended",
        "Project Completed",
        "Project Ended",
    ],
    // Terminal states (can go nowhere, or limited movement)
    "BGV Failed":             [],
    "Offer Rejected":         [],
    "Offer Withdrawn":        [],
    "Joining Backout":        [],
    "Absconded":              [],
    "Replacement Term Ended": [],
    "Project Completed":      [],
    "Project Ended":          [],
};

// ─── STATUS CATEGORY (for coloring) ──────────────────────────────────────────
export const SUBMISSION_STATUS_CATEGORY = {
    // Blue – pending/in-progress
    "For Validation":       "pending",
    "Need More Info":       "pending",
    "Internal Hold":        "hold",
    "Hold by Client":       "hold",
    "L1 Schedule Pending":  "pending",
    "L2 Schedule Pending":  "pending",
    "L3 Schedule Pending":  "pending",
    "L4 Schedule Pending":  "pending",
    "L1 Feedback Pending":  "pending",
    "L2 Feedback Pending":  "pending",
    "L3 Feedback Pending":  "pending",
    "L4 Feedback Pending":  "pending",
    "Final Select":         "positive",
    // Purple – scheduled
    "L1 Scheduled":         "interview",
    "L2 Scheduled":         "interview",
    "L3 Scheduled":         "interview",
    "L4 Scheduled":         "interview",
    "L1 Rescheduled":       "interview",
    "L2 Rescheduled":       "interview",
    "L3 Rescheduled":       "interview",
    "L4 Rescheduled":       "interview",
    // Orange – submitted
    "Submitted To Client":  "submitted",
    // Green – positive outcomes
    "Offer Sent":           "positive",
    "Offer Accepted":       "positive",
    "HR Discussion":        "positive",
    "Joined":               "hired",
    "Project Completed":    "hired",
    "Replacement Term Ended": "hired",
    // Red – rejections/negative
    "Internal Reject":      "rejected",
    "Screen Reject":        "rejected",
    "L1 Rejected":          "rejected",
    "L2 Rejected":          "rejected",
    "L3 Rejected":          "rejected",
    "L4 Rejected":          "rejected",
    "L1 Backout":           "backout",
    "L2 Backout":           "backout",
    "L3 Backout":           "backout",
    "L4 Backout":           "backout",
    "Final Backout":        "backout",
    "Offer Rejected":       "rejected",
    "Offer Withdrawn":      "rejected",
    "BGV Failed":           "rejected",
    "Joining Backout":      "backout",
    "Absconded":            "rejected",
    "Project Ended":        "neutral",
    "Position Closed":      "neutral",
    "Duplicate":            "neutral",
};

// ─── MAIN SUBMISSION SCHEMA ───────────────────────────────────────────────────
const submissionSchema = new mongoose.Schema({

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

    // Denormalized for fast reads
    candidateName: { type: String, trim: true, default: "" },
    jobTitle:      { type: String, trim: true, default: "" },
    clientName:    { type: String, trim: true, default: "" },

    // Pipeline state
    status: {
        type: String,
        enum: SUBMISSION_STATUSES,
        default: "For Validation",
    },

    // Status history for audit trail
    statusHistory: [{
        status:    { type: String },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note:      { type: String, default: "" },
    }],

    // Dates
    submittedDate: { type: Date, default: Date.now },

    // Notes
    recruiterNotes: { type: String, trim: true, default: "" },
    clientFeedback: { type: String, trim: true, default: "" },

    // Audit
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

}, { timestamps: true });

// ─── INDEXES ──────────────────────────────────────────────────────────────────
submissionSchema.index({ candidate: 1 });
submissionSchema.index({ job: 1 });
submissionSchema.index({ candidate: 1, job: 1 }, { unique: true });
submissionSchema.index({ status: 1 });

export default mongoose.model("Submission", submissionSchema);