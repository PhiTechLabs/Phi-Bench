import mongoose from "mongoose";

// ─── LOCATION SUBDOCUMENT ─────────────────────────────────────────────────────
const locationSchema = new mongoose.Schema({
    street:   { type: String, trim: true, default: "" },
    city:     { type: String, trim: true, default: "" },
    province: { type: String, trim: true, default: "" },
    code:     { type: String, trim: true, default: "" },
    country:  { type: String, trim: true, default: "" },
}, { _id: true });

// ─── POC SUBDOCUMENT ──────────────────────────────────────────────────────────
const pocSchema = new mongoose.Schema({
    firstName:   { type: String, required: true, trim: true },
    lastName:    { type: String, required: true, trim: true },
    contact:     { type: String, trim: true, default: "" },
    email:       { type: String, required: true, trim: true, lowercase: true },
    designation: { type: String, required: true, trim: true },
    linkedin:    { type: String, trim: true, default: "" },
    location:    { type: String, required: true, trim: true },
}, { _id: true });

// ─── DOCUMENT SUBDOCUMENT (reserved for Phase 2 — Cloudinary) ────────────────
const documentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    key: { type: String },
    uploadedAt: { type: Date, default: Date.now },
}, { _id: true });

// ─── MAIN CLIENT SCHEMA ───────────────────────────────────────────────────────
const clientSchema = new mongoose.Schema({
    // Human-readable reference code (CL001, CL002...), assigned once at
    // creation time by generateNextCode("client") — never set by the
    // client (the request body, that is — confusing name collision, but
    // this means "never set by the calling user"). sparse lets pre-existing
    // clients without a code coexist.
    code: { type: String, unique: true, sparse: true },

    clientName:     { type: String, required: true, trim: true },
    parentClient:   { type: String, trim: true, default: "" },
    contactNumber:  { type: String, required: true, trim: true },
    website:        { type: String, required: true, trim: true },
    accountManager: { type: String, trim: true, default: "" },
    linkedin:       { type: String, trim: true, default: "" },
    industry:       { type: String, trim: true, default: "" },
    about:          { type: String, trim: true, default: "" },
    source:         { type: String, trim: true, default: "" },

    locations: [locationSchema],
    pocs:      [pocSchema],
    documents: [documentSchema],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
    type: String,
    enum: ["Active", "Prospect", "Onboarding", "On Hold", "Inactive"],
    default: "Active",
    },
}, { timestamps: true });

export default mongoose.model("Client", clientSchema);