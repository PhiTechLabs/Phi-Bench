import express from "express";

import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
} from "../controllers/roleController.js";

import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/checkPermission.js";

import { PERMISSIONS } from "../config/permissions.js";

const router = express.Router();

// ─── GET ALL ROLES ─────────────────────────────────────────
router.get(
    "/",
    protect,
    checkPermission(PERMISSIONS.ROLE_VIEW),
    getRoles
);

// ─── CREATE ROLE ───────────────────────────────────────────
router.post(
    "/",
    protect,
    checkPermission(PERMISSIONS.ROLE_CREATE),
    createRole
);

// ─── UPDATE ROLE ───────────────────────────────────────────
router.put(
    "/:id",
    protect,
    checkPermission(PERMISSIONS.ROLE_EDIT),
    updateRole
);

// ─── DELETE ROLE ───────────────────────────────────────────
router.delete(
    "/:id",
    protect,
    checkPermission(PERMISSIONS.ROLE_DELETE),
    deleteRole
);

export default router;