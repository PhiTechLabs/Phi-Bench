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

import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.get(
    "/",
    protect,
    requirePermission("candidate", "view"),
    listCandidates
);

router.post(
    "/",
    protect,
    requirePermission("candidate", "add"),
    createCandidateRules,
    validate,
    createCandidate
);

router.get(
    "/:id",
    protect,
    requirePermission("candidate", "view"),
    getCandidateById
);

router.put(
    "/:id",
    protect,
    requirePermission("candidate", "edit"),
    updateCandidateRules,
    validate,
    updateCandidate
);

router.delete(
    "/:id",
    protect,
    requirePermission("candidate", "delete"),
    deleteCandidate
);

router.patch(
    "/:id/toggle-bench",
    protect,
    requirePermission("candidate", "edit"),
    toggleBench
);

export default router;