import express from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    updateUser,
    deleteUser,
    getAllUsers,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";
import { refreshAccessToken } from "../controllers/authController.js";
import { PERMISSIONS } from "../config/permissions.js";

const router = express.Router();

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", protect, logoutUser);

// ─── PROTECTED — any logged-in user ──────────────────────────────────────────
router.get("/users", protect, getAllUsers);

// ─── PROTECTED — permission-based (works for any role with USER_* permissions)
// Uses requirePermission instead of authorizeRoles so it checks the permissions
// array (incl. "*" wildcard for super_admin) rather than fragile role name strings
router.post("/register",    protect, requirePermission(PERMISSIONS.USER_CREATE), registerUser);
router.put("/update/:id",   protect, requirePermission(PERMISSIONS.USER_EDIT),   updateUser);
router.delete("/delete/:id",protect, requirePermission(PERMISSIONS.USER_DELETE), deleteUser);

export default router;