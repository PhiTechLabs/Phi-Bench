import express from "express";

import { previewCode } from "../controllers/codePreviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Read-only preview, available to any authenticated user who can reach a
// create form — the actual permission check for "can you create this kind
// of record" already happens on the real POST routes (requirePermission).
// This endpoint can't create, modify, or reserve anything, so it doesn't
// need its own permission gate beyond being logged in.
router.get("/:entityType", protect, previewCode);

export default router;