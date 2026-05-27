import express from "express";
import {
    createInterview,
    listInterviews,
    getCandidateInterviews,
    getJobInterviews,
    getInterview,
    updateInterview,
    deleteInterview,
    addFeedback,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";
import { PERMISSIONS } from "../config/permissions.js";

const router = express.Router();

// ─── COLLECTION ──────────────────────────────────────────────────────────────
router.get(
    "/",
    protect,
    requirePermission(PERMISSIONS.INTERVIEW_VIEW),
    listInterviews
);

router.post(
    "/",
    protect,
    requirePermission(PERMISSIONS.INTERVIEW_CREATE),
    createInterview
);

// ─── NESTED: by candidate ─────────────────────────────────────────────────────
router.get(
    "/candidate/:candidateId",
    protect,
    requirePermission(PERMISSIONS.INTERVIEW_VIEW),
    getCandidateInterviews
);

// ─── NESTED: by job ───────────────────────────────────────────────────────────
router.get(
    "/job/:jobId",
    protect,
    requirePermission(PERMISSIONS.INTERVIEW_VIEW),
    getJobInterviews
);

// ─── SINGLE RESOURCE ─────────────────────────────────────────────────────────
router.get(
    "/:id",
    protect,
    requirePermission(PERMISSIONS.INTERVIEW_VIEW),
    getInterview
);

router.put(
    "/:id",
    protect,
    requirePermission(PERMISSIONS.INTERVIEW_EDIT),
    updateInterview
);

router.delete(
    "/:id",
    protect,
    requirePermission(PERMISSIONS.INTERVIEW_DELETE),
    deleteInterview
);

// ─── DEDICATED ACTIONS ───────────────────────────────────────────────────────
router.patch(
    "/:id/feedback",
    protect,
    requirePermission(PERMISSIONS.INTERVIEW_EDIT),
    addFeedback
);

export default router;