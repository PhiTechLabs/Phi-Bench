import asyncHandler from "express-async-handler";
import { previewNextCode, CODE_PREFIXES } from "../utils/generateCode.js";

// ─── PREVIEW NEXT CODE ────────────────────────────────────────────────────────
// GET /code-preview/:entityType  — e.g. /code-preview/candidate -> { code: "CD014" }
// Read-only: does NOT reserve or increment anything. Powers the "Next code:
// CD014" preview shown on the Job/Candidate/Client create forms before save.
export const previewCode = asyncHandler(async (req, res) => {
    const { entityType } = req.params;

    if (!CODE_PREFIXES[entityType]) {
        res.status(400);
        throw new Error(
            `Unknown entity type "${entityType}" — expected one of: ${Object.keys(CODE_PREFIXES).join(", ")}`
        );
    }

    const code = await previewNextCode(entityType);
    res.json({ code });
});