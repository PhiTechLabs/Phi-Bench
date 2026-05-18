import express from "express";
import {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
} from "../controllers/jobController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

import { createJobRules, validate } from "../validators/jobValidator.js";

import { PERMISSIONS } from "../config/permissions.js";

const router = express.Router();

router.post(
    "/",
    protect,
    requirePermission(PERMISSIONS.JOB_CREATE),
    createJobRules,
    validate,
    createJob
);

router.get(
    "/",
    protect,
    requirePermission(PERMISSIONS.JOB_VIEW),
    getAllJobs
);

router.get(
    "/:id",
    protect,
    requirePermission(PERMISSIONS.JOB_VIEW),
    getJobById
);

router.put(
    "/:id",
    protect,
    requirePermission(PERMISSIONS.JOB_EDIT),
    createJobRules,
    validate,
    updateJob
);

router.delete(
    "/:id",
    protect,
    requirePermission(PERMISSIONS.JOB_DELETE),
    deleteJob
);

export default router;