import express from "express";

import {
    loginUser,
    logoutUser,
    registerUser,
    updateUser,
    deleteUser,
    getAllUsers,
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