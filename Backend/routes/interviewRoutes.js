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
    getUpcomingInterviews,
} from "../controllers/interviewController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.get(
    "/",
    protect,
    requirePermission("interview", "view"),
    listInterviews
);

router.post(
    "/",
    protect,
    requirePermission("interview", "add"),
    createInterview
);

router.get(
    "/candidate/:candidateId",
    protect,
    requirePermission("interview", "view"),
    getCandidateInterviews
);

router.get(
    "/job/:jobId",
    protect,
    requirePermission("interview", "view"),
    getJobInterviews
);

router.get(
    "/upcoming",
    protect,
    requirePermission("interview", "view"),
    getUpcomingInterviews
);

router.get(
    "/:id",
    protect,
    requirePermission("interview", "view"),
    getInterview
);

router.put(
    "/:id",
    protect,
    requirePermission("interview", "edit"),
    updateInterview
);

router.delete(
    "/:id",
    protect,
    requirePermission("interview", "delete"),
    deleteInterview
);

router.patch(
    "/:id/feedback",
    protect,
    requirePermission("interview", "edit"),
    addFeedback
);

export default router;