import express from "express";
import {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { createJobRules, validate } from "../validators/jobValidator.js";

const router = express.Router();

// ─── PROTECTED — superAdmin + admin only ─────────────────────────────────────
router.post(
    "/",
    protect,
    authorizeRoles("superAdmin", "admin"),
    createJobRules,
    validate,
    createJob
);

router.get("/", protect, authorizeRoles("superAdmin", "admin"), getAllJobs);
router.get("/:id", protect, authorizeRoles("superAdmin", "admin"), getJobById);

router.put(
    "/:id",
    protect,
    authorizeRoles("superAdmin", "admin"),
    createJobRules,
    validate,
    updateJob
);

router.delete("/:id", protect, authorizeRoles("superAdmin", "admin"), deleteJob);

export default router;