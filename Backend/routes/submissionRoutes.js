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

// ─── NESTED ──────────────────────────────────────────────────────────────────
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

// ─── SINGLE RESOURCE ─────────────────────────────────────────────────────────
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

// ─── SPECIAL ACTIONS ─────────────────────────────────────────────────────────
router.patch(
    "/:id/force-status",
    protect,
    requirePermission("submissions", "edit"),
    forceStatus
);

router.get(
    "/:id/transitions",
    protect,
    requirePermission("submissions", "view"),
    getAllowedTransitions
);

export default router;