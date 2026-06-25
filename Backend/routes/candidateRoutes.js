import express from "express";

import upload from "../middleware/uploadMiddleware.js"

import {
    createCandidate,
    listCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
    toggleBench,
    viewResume,
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

    upload.fields([
        { name: "resume", maxCount: 1 },
        { name: "formattedResume", maxCount: 1 },
        { name: "other", maxCount: 1 },
    ]),

    (req, res, next) => {

        try {

            if (req.body.education) {
                req.body.education = JSON.parse(req.body.education);
            }

            if (req.body.experience) {
                req.body.experience = JSON.parse(req.body.experience);
            }

        } catch (err) {

            return res.status(400).json({
                message: "Invalid education/experience JSON"
            });
        }

        next();
    },


    
    (req, res, next) => {
        console.log("BODY RECEIVED:");
        console.log(req.body);

        console.log("FILES RECEIVED:");
        console.log(req.files);

        next();
    },

    createCandidateRules,
    validate,
    createCandidate
);

    router.post(
    "/",
    protect,
    requirePermission("candidate", "add"),

    upload.fields([
        {
        name: "resume",
        maxCount: 1,
        },
        {
        name: "formattedResume",
        maxCount: 1,
        },
        {
        name: "other",
        maxCount: 1,
        },
    ]),

    createCandidateRules,
    validate,
    createCandidate
    );

router.get(
    "/:id/resume",
    protect,
    requirePermission(
        "candidate",
        "view"
    ),
    viewResume
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