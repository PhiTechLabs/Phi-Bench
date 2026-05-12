import mongoose from "mongoose";

// ─── EDUCATION SUBDOCUMENT ────────────────────────────────────────────────────
const educationSchema = new mongoose.Schema({
    institute: { type: String, trim: true, default: "" },
    major:     { type: String, trim: true, default: "" },
    degree:    { type: String, trim: true, default: "" },
    fromMonth: { type: String, trim: true, default: "" },
    fromYear:  { type: String, trim: true, default: "" },
    toMonth:   { type: String, trim: true, default: "" },
    toYear:    { type: String, trim: true, default: "" },
    pursuing:  { type: Boolean, default: false },
}, { _id: true });

// ─── EXPERIENCE SUBDOCUMENT ───────────────────────────────────────────────────
const experienceSchema = new mongoose.Schema({
    title:     { type: String, trim: true, default: "" },
    company:   { type: String, trim: true, default: "" },
    summary:   { type: String, trim: true, default: "" },
    fromMonth: { type: String, trim: true, default: "" },
    fromYear:  { type: String, trim: true, default: "" },
    toMonth:   { type: String, trim: true, default: "" },
    toYear:    { type: String, trim: true, default: "" },
    current:   { type: Boolean, default: false },
}, { _id: true });

// ─── ATTACHMENT SLOT SUBDOCUMENT (reserved for Phase 2 — Cloudinary) ─────────
// Each named slot (resume / formattedResume / other) holds either null or this shape.
const attachmentSlotSchema = new mongoose.Schema({
    name:       { type: String, required: true },
    url:        { type: String, required: true },
    publicId:   { type: String },
    uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

// ─── STATUS PIPELINE ──────────────────────────────────────────────────────────
export const CANDIDATE_STATUSES = [
    "New", "Screening", "Shortlisted", "Interview", "Offer",
    "Hired", "Rejected", "On Hold", "Withdrawn",
];

// ─── MAIN CANDIDATE SCHEMA ────────────────────────────────────────────────────
const candidateSchema = new mongoose.Schema({
    // Basic
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     {
        type: String, required: true, trim: true, lowercase: true,
        unique: true, // enforces uniqueness at DB index level
    },
    phone:     { type: String, trim: true, default: "" },

    // Address
    street:  { type: String, trim: true, default: "" },
    city:    { type: String, trim: true, default: "" },
    state:   { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },

    // Profile
    experienceYears: { type: String, trim: true, default: "" }, // string in form, store as-is
    jobTitle:        { type: String, trim: true, default: "" },
    qualification:   { type: String, trim: true, default: "" },
    expectedSalary:  { type: String, trim: true, default: "" },
    currentSalary:   { type: String, trim: true, default: "" },
    linkedin:        { type: String, trim: true, default: "" },
    skills:          { type: String, trim: true, default: "" },
    noticePeriod:    { type: String, trim: true, default: "" }, // shown in table, editable later

    // Pipeline state
    status: {
        type: String,
        enum: CANDIDATE_STATUSES,
        default: "New",
    },
    onBench: { type: Boolean, default: false },

    // Arrays
    education:  [educationSchema],
    experience: [experienceSchema],

    // Attachments — named slots, each null or filled
    attachments: {
        resume:          { type: attachmentSlotSchema, default: null },
        formattedResume: { type: attachmentSlotSchema, default: null },
        other:           { type: attachmentSlotSchema, default: null },
    },

    // Audit
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
});

// ─── VIRTUAL FIELDS (computed, not stored — but appear in JSON output) ───────
// Detail page expects `candidate.name` and `candidate.initials`. Compute on read
// so frontend gets them for free without us having to write them on save.

candidateSchema.virtual("name").get(function () {
    return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

candidateSchema.virtual("initials").get(function () {
    const f = this.firstName?.[0] || "";
    const l = this.lastName?.[0]  || "";
    return (f + l).toUpperCase();
});

// `company` column in the candidates table is the current job's company.
// Pull it from the latest experience entry (or the one marked current=true).
candidateSchema.virtual("company").get(function () {
    if (!Array.isArray(this.experience) || this.experience.length === 0) return "";
    const current = this.experience.find(e => e.current);
    return current?.company || this.experience[this.experience.length - 1]?.company || "";
});

// Convenient single-name "experience" string for the table column.
// (The table column key is "experience" but the underlying data is experienceYears.)
// Frontend can keep reading candidate.experienceYears too; this virtual is for clarity.

export default mongoose.model("Candidate", candidateSchema);