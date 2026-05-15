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
import { authorize } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// All routes require auth + (superAdmin or admin)
const guard = [protect,authorize("candidate.view")];

// ─── COLLECTION ──────────────────────────────────────────────────────────────
router.get("/", guard, listCandidates);
router.post(
    "/",
    protect,
    authorize("candidate.create"),
    createCandidateRules,
    validate,
    createCandidate
);

// ─── SINGLE RESOURCE ─────────────────────────────────────────────────────────
router.get("/:id", guard, getCandidateById);
router.put("/:id", protect, authorize("candidate.edit"), updateCandidateRules, validate, updateCandidate);
router.delete("/:id", protect, authorize("candidate.delete"), deleteCandidate);

// ─── DEDICATED ACTIONS ───────────────────────────────────────────────────────
router.patch("/:id/toggle-bench", protect, authorize("candidate.edit"), toggleBench);

export default router;