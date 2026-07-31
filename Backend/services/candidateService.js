import Candidate from "../models/Candidate.js";
import User from "../models/User.js";
import {
    buildScopeFilter,
} from "../utils/permissionScope.js";

import {
    uploadToS3,
    getSignedFileUrl,
} from "./s3Service.js";

import { generateNextCode } from "../utils/generateCode.js";

// ─── HELPER: build a clean payload (no stray frontend-only fields) ───────────
const sanitizeArrays = (payload) => {
    const clean = { ...payload };

    if (Array.isArray(clean.education)) {
        clean.education = clean.education.map(
            ({ _id, id, ...rest }) => rest
        );
    }

    if (Array.isArray(clean.experience)) {
        clean.experience = clean.experience.map(
            ({ _id, id, ...rest }) => rest
        );
    }

    return clean;
};

// ─── HELPER: check if a record is in scope (non-throwing) ────────────────────
// Used to compute canEdit/canDelete flags for the frontend so it can hide
// action buttons that would fail anyway, instead of only finding out after
// clicking Save/Delete/Toggle Bench.
const isCandidateInScope = async (currentUser, action, candidate) => {
    const scopeFilter = await buildScopeFilter(currentUser, "candidate", action);

    // "none"/unconfigured permission for this action — never allowed
    if (scopeFilter === false) return false;

    // "all" scope — always allowed
    if (scopeFilter === null) return true;

    const allowedIds = scopeFilter.createdBy.$in.map((id) => id.toString());

    // candidate.createdBy may be a populated sub-document ({ _id, username })
    // or a bare ObjectId, depending on which service function fetched it.
    const ownerId = (candidate.createdBy?._id ?? candidate.createdBy)?.toString();

    return !!ownerId && allowedIds.includes(ownerId);
};

// ─── HELPER: enforce record-level scope (throwing) ────────────────────────────
// requirePermission (route middleware) only checks that the permission value
// isn't "none" — it has no idea which record is being touched. This compares
// a SPECIFIC candidate's createdBy against the caller's resolved scope
// (own / team / hierarchy / all) for a given action.
const ensureCandidateInScope = async (currentUser, action, candidate) => {
    const inScope = await isCandidateInScope(currentUser, action, candidate);
    if (!inScope) {
        const err = new Error("You do not have permission to modify this record");
        err.statusCode = 403;
        throw err;
    }
};

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const createCandidateService = async (
    payload,
    files,
    userId
) => {
    const attachments = {
        resume: null,
        formattedResume: null,
        other: null,
    };

    try {

        // Resume
        if (files?.resume?.[0]) {

            const uploaded =
                await uploadToS3(
                    files.resume[0],
                    "candidates/resumes"
                );

            attachments.resume = {
                name: files.resume[0].originalname,
                url: uploaded.url,
                key: uploaded.key,
                uploadedAt: new Date(),
            };
        }

        // Formatted Resume
        if (files?.formattedResume?.[0]) {

            const uploaded =
                await uploadToS3(
                    files.formattedResume[0],
                    "candidates/formatted-resumes"
                );

            attachments.formattedResume = {
                name: files.formattedResume[0].originalname,
                url: uploaded.url,
                key: uploaded.key,
                uploadedAt: new Date(),
            };
        }

        // Other Document
        if (files?.other?.[0]) {

            const uploaded =
                await uploadToS3(
                    files.other[0],
                    "candidates/other-documents"
                );

            attachments.other = {
                name: files.other[0].originalname,
                url: uploaded.url,
                key: uploaded.key,
                uploadedAt: new Date(),
            };
        }

        const code = await generateNextCode("candidate");

        const data = {
            ...sanitizeArrays(payload),
            code,
            attachments,
            createdBy: userId,
        };

        const education = Array.isArray(payload.education)
            ? payload.education
            : JSON.parse(payload.education || "[]");

        const experience = Array.isArray(payload.experience)
            ? payload.experience
            : JSON.parse(payload.experience || "[]");

        return await Candidate.create(data);

    } catch (err) {

        if (err.code === 11000) {

            // Be precise about which unique field actually collided — don't
            // blame "email" when it was really the generated code (or vice
            // versa). err.keyPattern is set by the MongoDB driver for E11000
            // and tells us exactly which index was violated.
            const field = err.keyPattern
                ? Object.keys(err.keyPattern)[0]
                : "email";

            const dupErr = new Error(
                field === "code"
                    ? "Could not assign a candidate code — please try saving again"
                    : "A candidate with this email already exists"
            );

            dupErr.statusCode = 409;

            throw dupErr;
        }

        throw err;
    }
};

// ─── LIST ────────────────────────────────────────────────────────────────────
// Accepts the already-authenticated req.user (populated by the protect
// middleware, which already fetched User + roleId for this request) —
// NOT a raw userId. Re-fetching the user here would mean doing the
// exact same User.findById().populate("roleId") lookup a second time
// on every single request, which was adding a full extra database
// round-trip to every candidate list load for no reason.
export const listCandidatesService = async (currentUser) => {

    // buildScopeFilter reads the role's candidate.view permission and
    // returns the correct MongoDB filter for this user's scope:
    //   false  → no view permission (return empty)
    //   null   → "all" scope (no createdBy filter)
    //   object → { createdBy: { $in: [...] } }
    const scopeFilter = await buildScopeFilter(currentUser, "candidate", "view");
    if (scopeFilter === false) return [];
    const query = scopeFilter ?? {};

    return Candidate.find(query)
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
        .sort({ createdAt: -1 });
};

// ─── GET BY ID (scoped) ────────────────────────────────────────────────────────
// Previously had no scope check at all — any authenticated user with a
// non-"none" view permission could fetch ANY candidate by id, regardless of
// "own"/"team"/"hierarchy" scoping (scoping only applied to the list).
// Also attaches `_permissions` so the frontend can hide Edit/Delete/Toggle
// Bench buttons for records the user can view but not modify.
export const getCandidateByIdService = async (
    id,
    currentUser
) => {

    const candidate = await Candidate.findById(id)
        .populate("createdBy", "username")
        .populate("updatedBy", "username");

    if (!candidate) {

        const err = new Error(
            "Candidate not found"
        );

        err.statusCode = 404;

        throw err;
    }

    await ensureCandidateInScope(currentUser, "view", candidate);

    const [canEdit, canDelete] = await Promise.all([
        isCandidateInScope(currentUser, "edit", candidate),
        isCandidateInScope(currentUser, "delete", candidate),
    ]);

    const candidateObj = candidate.toObject();
    candidateObj._permissions = { canEdit, canDelete };

    return candidateObj;
};

// ─── UPDATE (scoped) ───────────────────────────────────────────────────────────
export const updateCandidateService = async (
    id,
    payload,
    currentUser
) => {

    const existingCandidate = await Candidate.findById(id);

    if (!existingCandidate) {
        const err = new Error("Candidate not found");
        err.statusCode = 404;
        throw err;
    }

    // Enforce edit scope BEFORE applying any changes — this is the check
    // that was missing entirely, which let a scoped "edit" permission
    // (e.g. team-only) update any candidate system-wide.
    await ensureCandidateInScope(currentUser, "edit", existingCandidate);

    const updates =
        sanitizeArrays(payload);

    delete updates.attachments;

    updates.updatedBy = currentUser._id;

    try {

        const candidate =
            await Candidate.findByIdAndUpdate(
                id,
                updates,
                {
                    new: true,
                    runValidators: true,
                }
            );

        return candidate;

    } catch (err) {

        if (err.code === 11000) {

            const dupErr = new Error(
                "Another candidate already uses this email"
            );

            dupErr.statusCode = 409;

            throw dupErr;
        }

        throw err;
    }
};

// ─── DELETE (scoped) ───────────────────────────────────────────────────────────
export const deleteCandidateService = async (
    id,
    currentUser
) => {

    const existingCandidate = await Candidate.findById(id);

    if (!existingCandidate) {
        const err = new Error("Candidate not found");
        err.statusCode = 404;
        throw err;
    }

    await ensureCandidateInScope(currentUser, "delete", existingCandidate);

    await Candidate.findByIdAndDelete(id);

    return existingCandidate;
};

// ─── TOGGLE BENCH (scoped) ──────────────────────────────────────────────────────
// Route is gated by requirePermission("candidate", "edit") — same
// record-level gap as update: no check on whether THIS candidate falls
// within the caller's edit scope.
export const toggleBenchService = async (
    id,
    currentUser
) => {

    const candidate =
        await Candidate.findById(id);

    if (!candidate) {

        const err = new Error(
            "Candidate not found"
        );

        err.statusCode = 404;

        throw err;
    }

    await ensureCandidateInScope(currentUser, "edit", candidate);

    candidate.onBench =
        !candidate.onBench;

    await candidate.save();

    return candidate;
};

// ─── VIEW RESUME (scoped) ───────────────────────────────────────────────────────
// Route is gated by requirePermission("candidate", "view") — same
// record-level gap: no check on whether THIS candidate's resume falls
// within the caller's view scope.
export const getCandidateResumeService = async (
    candidateId,
    currentUser
) => {

    const candidate =
        await Candidate.findById(candidateId);

    if (!candidate) {

        const err = new Error(
            "Candidate not found"
        );

        err.statusCode = 404;

        throw err;
    }

    await ensureCandidateInScope(currentUser, "view", candidate);

    const resume =
        candidate.attachments?.resume;

    if (!resume?.key) {

        const err = new Error(
            "Resume not found"
        );

        err.statusCode = 404;

        throw err;
    }

    const signedUrl =
        await getSignedFileUrl(
            resume.key
        );

    return signedUrl;
};