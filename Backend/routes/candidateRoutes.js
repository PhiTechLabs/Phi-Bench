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
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
    createCandidateRules,
    updateCandidateRules,
    validate,
} from "../validators/candidateValidator.js";

const router = express.Router();

// All routes require auth + (superAdmin or admin)
const guard = [protect, authorizeRoles("superAdmin", "admin")];

// ─── COLLECTION ──────────────────────────────────────────────────────────────
router.get("/", guard, listCandidates);
router.post("/", guard, createCandidateRules, validate, createCandidate);

// ─── SINGLE RESOURCE ─────────────────────────────────────────────────────────
router.get("/:id", guard, getCandidateById);
router.put("/:id", guard, updateCandidateRules, validate, updateCandidate);
router.delete("/:id", guard, deleteCandidate);

// ─── DEDICATED ACTIONS ───────────────────────────────────────────────────────
router.patch("/:id/toggle-bench", guard, toggleBench);

export default router;