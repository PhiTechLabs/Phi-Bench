import { body, validationResult } from "express-validator";

// ─── VALIDATION RULES FOR CREATE/UPDATE JOB ──────────────────────────────────
export const createJobRules = [
    body("title")
        .trim().notEmpty().withMessage("Position title is required")
        .isLength({ max: 200 }).withMessage("Title too long"),

    body("client")
        .trim().notEmpty().withMessage("Client name is required")
        .isLength({ max: 200 }).withMessage("Client name too long"),

    body("description")
        .trim().notEmpty().withMessage("Job description is required")
        .isLength({ max: 10000 }).withMessage("Description too long"),

    body("status")
        .optional({ checkFalsy: true })
        .isIn(["Open", "Closed", "On Hold", "Filled"])
        .withMessage("Invalid status"),

    body("dateOpened").optional({ checkFalsy: true })
        .isISO8601().withMessage("Invalid date format for dateOpened"),

    body("targetDate").optional({ checkFalsy: true })
        .isISO8601().withMessage("Invalid date format for targetDate"),

    body("contact").optional().trim().isLength({ max: 200 }),
    body("manager").optional().trim().isLength({ max: 200 }),
    body("recruiter").optional().trim().isLength({ max: 200 }),
    body("jobType").optional().trim().isLength({ max: 100 }),
    body("experience").optional().trim().isLength({ max: 100 }),
    body("industry").optional().trim().isLength({ max: 100 }),
    body("salary").optional().trim().isLength({ max: 100 }),
    body("skills").optional().trim().isLength({ max: 2000 }),
    body("city").optional().trim().isLength({ max: 100 }),
    body("country").optional().trim().isLength({ max: 100 }),
    body("postInfo").optional().trim().isLength({ max: 500 }),
];

// ─── MIDDLEWARE: RUN VALIDATION & SHORT-CIRCUIT ON ERROR ──────────────────────
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
 
