import express from "express";

import {
    loginUser,
    logoutUser,
    registerUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getUsersPicker,
    refreshAccessToken,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// PUBLIC
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

// AUTH
router.post("/logout", protect, logoutUser);

// USERS
router.get(
    "/users",
    protect,
    requirePermission("users", "view"),
    getAllUsers
);

// Lightweight "picker" list — any authenticated user, no users:view gate.
// Used by dropdowns like Job's Account Manager / Assign Recruiter fields.
router.get(
    "/users/picker",
    protect,
    getUsersPicker
);

router.post(
    "/register",
    protect,
    requirePermission("users", "add"),
    registerUser
);

router.put(
    "/update/:id",
    protect,
    requirePermission("users", "edit"),
    updateUser
);

router.delete(
    "/delete/:id",
    protect,
    requirePermission("users", "delete"),
    deleteUser
);

export default router;