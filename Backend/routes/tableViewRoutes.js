import express from "express";
import { getTableViews, saveTableViews } from "../controllers/tableViewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// No requirePermission gate here on purpose — this is always just the
// logged-in user's own saved DataTable views/columns, not a module resource,
// so being authenticated is the only requirement (same pattern as the
// "picker" endpoint in authRoutes.js).
router.get("/:tableKey", protect, getTableViews);
router.put("/:tableKey", protect, saveTableViews);

export default router;