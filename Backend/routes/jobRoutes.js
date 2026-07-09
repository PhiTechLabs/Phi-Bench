import express from "express";

import {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
} from "../controllers/jobController.js";

import { protect } from "../middleware/authMiddleware.js";

import {
    createJobRules,
    updateJobRules,
    validate,
} from "../validators/jobValidator.js";

import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    requirePermission("job", "add"),
    createJobRules,
    validate,
    createJob
);

router.get(
    "/",
    protect,
    requirePermission("job", "view"),
    getAllJobs
);

router.get(
    "/:id",
    protect,
    requirePermission("job", "view"),
    getJobById
);

router.put(
    "/:id",
    protect,
    requirePermission("job", "edit"),
    updateJobRules,
    validate,
    updateJob
);

router.delete(
    "/:id",
    protect,
    requirePermission("job", "delete"),
    deleteJob
);

export default router;