import express from "express";
import {
    createCandidate,
    listCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
    toggleBench,
} from "../controllers/candidateController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
    createCandidateRules,
    updateCandidateRules,
    validate,
} from "../validators/candidateValidator.js";
import { requirePermission  } from "../middleware/permissionMiddleware.js";
import { PERMISSIONS } from "../config/permissions.js";

const router = express.Router();

// All routes require auth + (superAdmin or admin)
const guard = [
    protect,
    requirePermission(PERMISSIONS.CANDIDATE_VIEW)
];

// ─── COLLECTION ──────────────────────────────────────────────────────────────
router.get("/", guard, listCandidates);
router.post(
    "/",
    protect,
    requirePermission(PERMISSIONS.CANDIDATE_CREATE),
    createCandidateRules,
    validate,
    createCandidate
);

// ─── SINGLE RESOURCE ─────────────────────────────────────────────────────────
router.get("/:id", guard, getCandidateById);
router.put("/:id", protect, requirePermission(PERMISSIONS.CANDIDATE_EDIT), updateCandidateRules, validate, updateCandidate);
router.delete("/:id", protect, requirePermission(PERMISSIONS.CANDIDATE_DELETE), deleteCandidate);

// ─── DEDICATED ACTIONS ───────────────────────────────────────────────────────
router.patch("/:id/toggle-bench", protect, requirePermission(PERMISSIONS.CANDIDATE_EDIT), toggleBench);

export default router;