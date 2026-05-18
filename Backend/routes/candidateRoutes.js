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

const router = express.Router();

// All routes require auth + (superAdmin or admin)
const guard = [protect,requirePermission("candidate.view")];

// ─── COLLECTION ──────────────────────────────────────────────────────────────
router.get("/", guard, listCandidates);
router.post(
    "/",
    protect,
    requirePermission("candidate.create"),
    createCandidateRules,
    validate,
    createCandidate
);

// ─── SINGLE RESOURCE ─────────────────────────────────────────────────────────
router.get("/:id", guard, getCandidateById);
router.put("/:id", protect, requirePermission("candidate.edit"), updateCandidateRules, validate, updateCandidate);
router.delete("/:id", protect, requirePermission("candidate.delete"), deleteCandidate);

// ─── DEDICATED ACTIONS ───────────────────────────────────────────────────────
router.patch("/:id/toggle-bench", protect, requirePermission("candidate.edit"), toggleBench);

export default router;