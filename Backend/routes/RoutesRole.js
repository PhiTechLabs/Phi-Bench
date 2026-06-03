import express from "express";

import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getPermissions,
    updateModulePermissions,
} from "../controllers/roleController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.get(
    "/",
    protect,
    requirePermission("roles", "view"),
    getRoles
);

router.get(
    "/permissions",
    protect,
    requirePermission("roles", "view"),
    getPermissions
);

router.post(
    "/",
    protect,
    requirePermission("roles", "add"),
    createRole
);

router.put(
    "/:id",
    protect,
    requirePermission("roles", "edit"),
    updateRole
);

router.put(
    "/:id/permissions",
    protect,
    requirePermission("roles", "edit"),
    updateModulePermissions
);

router.delete(
    "/:id",
    protect,
    requirePermission("roles", "delete"),
    deleteRole
);

export default router;