import { body, validationResult } from "express-validator";
import { CANDIDATE_STATUSES } from "../models/Candidate.js";

// ─── CREATE RULES (all required-ness enforced) ───────────────────────────────
export const createCandidateRules = [
    // Basic
    body("firstName").trim().notEmpty().withMessage("First name is required")
        .isLength({ max: 100 }).withMessage("First name too long"),

    body("lastName").trim().notEmpty().withMessage("Last name is required")
        .isLength({ max: 100 }).withMessage("Last name too long"),

    body("email").trim().notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address")
        .normalizeEmail(),

    body("phone").optional({ checkFalsy: true }).trim()
        .isLength({ min: 6, max: 20 }).withMessage("Invalid phone number"),

    // Profile
    body("linkedin").optional({ checkFalsy: true }).trim()
        .matches(/^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i)
        .withMessage("LinkedIn URL must be a linkedin.com link"),

    body("experienceYears").optional({ checkFalsy: true }).trim()
        .isLength({ max: 10 }).withMessage("Invalid experience value"),

    body("expectedSalary").optional({ checkFalsy: true }).trim()
        .isLength({ max: 15 }).withMessage("Invalid salary"),

    body("currentSalary").optional({ checkFalsy: true }).trim()
        .isLength({ max: 15 }).withMessage("Invalid salary"),

    // Status (mostly relevant on update, but allow on create too)
    body("status").optional()
        .isIn(CANDIDATE_STATUSES)
        .withMessage("Invalid status"),

    body("onBench").optional().isBoolean()
        .withMessage("onBench must be boolean"),

    // Arrays — only check shape, not contents (form allows partial entries)
    body("education").optional().isArray()
        .withMessage("Education must be an array"),

    body("experience").optional().isArray()
        .withMessage("Experience must be an array"),
];

// ─── UPDATE RULES (everything optional) ──────────────────────────────────────
export const updateCandidateRules = [
    body("firstName").optional().trim().notEmpty().withMessage("First name cannot be empty")
        .isLength({ max: 100 }),

    body("lastName").optional().trim().notEmpty().withMessage("Last name cannot be empty")
        .isLength({ max: 100 }),

    body("email").optional().trim()
        .isEmail().withMessage("Invalid email")
        .normalizeEmail(),

    body("phone").optional({ checkFalsy: true }).trim()
        .isLength({ min: 6, max: 20 }),

    body("linkedin").optional({ checkFalsy: true }).trim()
        .matches(/^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i)
        .withMessage("LinkedIn URL must be a linkedin.com link"),

    body("status").optional()
        .isIn(CANDIDATE_STATUSES)
        .withMessage("Invalid status"),

    body("onBench").optional().isBoolean(),

    body("education").optional().isArray(),
    body("experience").optional().isArray(),
];

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array().map(e => ({
                field: e.path,
                message: e.msg,
            })),
        });
    }
    next();
};