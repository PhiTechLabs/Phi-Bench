import mongoose from "mongoose";

// ─── SUBMISSION STATUS PIPELINE ──────────────────────────────────────────────
export const SUBMISSION_STATUSES = [
    "Submitted",
    "Under Review",
    "Shortlisted",
    "Interview Scheduled",
    "Offer Extended",
    "Hired",
    "Rejected",
    "On Hold",
    "Withdrawn",
];

// ─── MAIN SUBMISSION SCHEMA ───────────────────────────────────────────────────
const submissionSchema = new mongoose.Schema({

    // Core references — candidate + job are required
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

    // Denormalized for fast reads (so list views don't need extra populates)
    candidateName: { type: String, trim: true, default: "" },
    jobTitle:      { type: String, trim: true, default: "" },
    clientName:    { type: String, trim: true, default: "" },

    // Pipeline state
    status: {
        type: String,
        enum: SUBMISSION_STATUSES,
        default: "Submitted",
    },

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

// ─── INDEX: fast lookups by candidate and job ─────────────────────────────────
submissionSchema.index({ candidate: 1 });
submissionSchema.index({ job: 1 });
// Prevent duplicate submissions of same candidate to same job
submissionSchema.index({ candidate: 1, job: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);