import express from "express";

import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
} from "../controllers/roleController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

import { PERMISSIONS } from "../config/permissions.js";

const router = express.Router();

// ─── GET ALL ROLES ─────────────────────────────────────────
router.get(
    "/",
    protect,
    requirePermission(PERMISSIONS.ROLE_VIEW),
    getRoles
);

// ─── CREATE ROLE ───────────────────────────────────────────
router.post(
    "/",
    protect,
    requirePermission(PERMISSIONS.ROLE_CREATE),
    createRole
);

// ─── UPDATE ROLE ───────────────────────────────────────────
router.put(
    "/:id",
    protect,
    requirePermission(PERMISSIONS.ROLE_EDIT),
    updateRole
);

// ─── DELETE ROLE ───────────────────────────────────────────
router.delete(
    "/:id",
    protect,
    requirePermission(PERMISSIONS.ROLE_DELETE),
    deleteRole
);

export default router;