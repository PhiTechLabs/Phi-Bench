import { body, validationResult } from "express-validator";

// ─── VALIDATION RULES FOR CREATE CLIENT ──────────────────────────────────────
export const createClientRules = [
    // Client info
    body("clientName")
        .trim().notEmpty().withMessage("Client name is required")
        .isLength({ max: 200 }).withMessage("Client name too long"),

    body("contactNumber")
        .trim().notEmpty().withMessage("Contact number is required")
        .isLength({ min: 6, max: 20 }).withMessage("Invalid contact number"),

    body("website")
        .trim().notEmpty().withMessage("Website is required")
        .isURL({ require_protocol: false }).withMessage("Invalid website URL"),

    body("linkedin").optional({ checkFalsy: true }).trim()
        .isURL().withMessage("Invalid LinkedIn URL"),

    body("about").optional().trim()
        .isLength({ max: 2000 }).withMessage("About text too long"),

    // Locations array (optional, but if present, validate each item)
    body("locations").optional().isArray()
        .withMessage("Locations must be an array"),

    // POCs array
    body("pocs").optional().isArray()
        .withMessage("POCs must be an array"),

    body("pocs.*.firstName")
        .if(body("pocs").exists({ checkFalsy: true }))
        .trim().notEmpty().withMessage("POC first name is required"),

    body("pocs.*.lastName")
        .if(body("pocs").exists({ checkFalsy: true }))
        .trim().notEmpty().withMessage("POC last name is required"),

    body("pocs.*.email")
        .if(body("pocs").exists({ checkFalsy: true }))
        .trim().notEmpty().withMessage("POC email is required")
        .isEmail().withMessage("Invalid POC email"),

    body("pocs.*.designation")
        .if(body("pocs").exists({ checkFalsy: true }))
        .trim().notEmpty().withMessage("POC designation is required"),

    body("pocs.*.location")
        .if(body("pocs").exists({ checkFalsy: true }))
        .trim().notEmpty().withMessage("POC location is required"),

    body("pocs.*.linkedin")
        .optional({ checkFalsy: true }).trim()
        .isURL().withMessage("Invalid POC LinkedIn URL"),
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