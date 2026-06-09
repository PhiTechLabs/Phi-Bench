import express from "express";

import {
    createSubmission,
    listSubmissions,
    getCandidateSubmissions,
    getJobSubmissions,
    getSubmission,
    updateSubmission,
    deleteSubmission,
    forceStatus,
    getAllowedTransitions,
} from "../controllers/submissionController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// ─── COLLECTION ──────────────────────────────────────────────────────────────
router.get("/", protect, requirePermission(PERMISSIONS.SUBMISSION_VIEW), listSubmissions);
router.post("/", protect, requirePermission(PERMISSIONS.SUBMISSION_CREATE), createSubmission);

// ─── NESTED ──────────────────────────────────────────────────────────────────
router.get("/candidate/:candidateId", protect, requirePermission(PERMISSIONS.SUBMISSION_VIEW), getCandidateSubmissions);
router.get("/job/:jobId", protect, requirePermission(PERMISSIONS.SUBMISSION_VIEW), getJobSubmissions);

// ─── SINGLE RESOURCE ─────────────────────────────────────────────────────────
router.get("/:id", protect, requirePermission(PERMISSIONS.SUBMISSION_VIEW), getSubmission);
router.put("/:id", protect, requirePermission(PERMISSIONS.SUBMISSION_EDIT), updateSubmission);
router.delete("/:id", protect, requirePermission(PERMISSIONS.SUBMISSION_DELETE), deleteSubmission);

// ─── SPECIAL ACTIONS ─────────────────────────────────────────────────────────
router.patch("/:id/force-status", protect, requirePermission(PERMISSIONS.SUBMISSION_EDIT), forceStatus);
router.get("/:id/transitions", protect, requirePermission(PERMISSIONS.SUBMISSION_VIEW), getAllowedTransitions);
router.get(
    "/",
    protect,
    requirePermission("submissions", "view"),
    listSubmissions
);

router.post(
    "/",
    protect,
    requirePermission("submissions", "add"),
    createSubmission
);

router.get(
    "/candidate/:candidateId",
    protect,
    requirePermission("submissions", "view"),
    getCandidateSubmissions
);

router.get(
    "/job/:jobId",
    protect,
    requirePermission("submissions", "view"),
    getJobSubmissions
);

router.get(
    "/:id",
    protect,
    requirePermission("submissions", "view"),
    getSubmission
);

router.put(
    "/:id",
    protect,
    requirePermission("submissions", "edit"),
    updateSubmission
);

router.delete(
    "/:id",
    protect,
    requirePermission("submissions", "delete"),
    deleteSubmission
);

export default router;