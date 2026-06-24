    import Candidate from "../models/Candidate.js";
    import User from "../models/User.js";
    import {
    getAccessibleUserIds,
    } from "../utils/permissionScope.js";

    import {
    uploadToS3,
    } from "./s3Service.js";

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

        const data = {
        ...sanitizeArrays(payload),
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

        const dupErr = new Error(
            "A candidate with this email already exists"
        );

        dupErr.statusCode = 409;

        throw dupErr;
        }

        throw err;
    }
    };

    // ─── LIST ────────────────────────────────────────────────────────────────────
    export const listCandidatesService = async (userId) => {

    const user = await User.findById(userId)
        .populate("roleId");

    const viewPermission =
        user.roleId?.modulePermissions?.candidate?.view;

    if (
        !viewPermission ||
        viewPermission === "none"
    ) {
        return [];
    }

    if (viewPermission === "all") {

        return Candidate.find()
        .sort({ createdAt: -1 });
    }

    const accessibleUsers =
        await getAccessibleUserIds(
        user,
        viewPermission
        );

    return Candidate.find({
        createdBy: {
        $in: accessibleUsers,
        },
    }).sort({
        createdAt: -1,
    });
    };

    // ─── GET BY ID ───────────────────────────────────────────────────────────────
    export const getCandidateByIdService = async (
    id,
    userId
    ) => {

    const candidate = await Candidate.findById(id)
        .populate("createdBy", "username role");

    if (!candidate) {

        const err = new Error(
        "Candidate not found"
        );

        err.statusCode = 404;

        throw err;
    }

    return candidate;
    };

    // ─── UPDATE ──────────────────────────────────────────────────────────────────
    export const updateCandidateService = async (
    id,
    payload
    ) => {

    const updates =
        sanitizeArrays(payload);

    delete updates.attachments;

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

        if (!candidate) {

        const err = new Error(
            "Candidate not found"
        );

        err.statusCode = 404;

        throw err;
        }

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

    // ─── DELETE ──────────────────────────────────────────────────────────────────
    export const deleteCandidateService = async (
    id
    ) => {

    const candidate =
        await Candidate.findByIdAndDelete(id);

    if (!candidate) {

        const err = new Error(
        "Candidate not found"
        );

        err.statusCode = 404;

        throw err;
    }

    return candidate;
    };

    // ─── TOGGLE BENCH ────────────────────────────────────────────────────────────
    export const toggleBenchService = async (
    id
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

    candidate.onBench =
        !candidate.onBench;

    await candidate.save();

    return candidate;
    };