import express from "express";

import {
    createSubmission,
    listSubmissions,
    getCandidateSubmissions,
    getJobSubmissions,
    getSubmission,
    updateSubmission,
    deleteSubmission,
} from "../controllers/submissionController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

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