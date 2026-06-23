import mongoose from "mongoose";

// ─── MAIN JOB SCHEMA ──────────────────────────────────────────────────────────
const jobSchema = new mongoose.Schema({
    // Job Info
    title:          { type: String, required: true, trim: true },

    // Reference to the actual Client document — this is the source of truth.
    // A job can only be created against a client that already exists.
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true,
    },
    // Denormalized client name, kept in sync with Client.clientName at write
    // time. Exists so list/table views don't need to populate clientId just
    // to show the name. Never trust this field as the source of truth.
    client:         { type: String, required: true, trim: true },

    contact:        { type: String, trim: true, default: "" },
    manager:        { type: String, trim: true, default: "" },
    recruiter:      { type: String, trim: true, default: "" },
    status: {
        type: String,
        enum: ["Open", "Closed", "On Hold", "Filled"],
        default: "Open",
    },
    dateOpened:     { type: Date },
    targetDate:     { type: Date },
    jobType:        { type: String, trim: true, default: "" },
    experience:     { type: String, trim: true, default: "" },
    industry:       { type: String, trim: true, default: "" },
    salary:         { type: String, trim: true, default: "" },
    skills:         { type: String, trim: true, default: "" },

    // Location & Posting
    city:           { type: String, trim: true, default: "" },
    country:        { type: String, trim: true, default: "" },
    postInfo:       { type: String, trim: true, default: "" },

    // Description
    description:    { type: String, required: true, trim: true },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

// ─── INDEXES ──────────────────────────────────────────────────────────────────
jobSchema.index({ clientId: 1 });

export default mongoose.model("Job", jobSchema);