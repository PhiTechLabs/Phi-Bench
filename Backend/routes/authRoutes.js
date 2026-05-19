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
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { refreshAccessToken } from "../controllers/authController.js";

const router = express.Router();

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", protect, logoutUser);

// ─── PROTECTED — any logged-in user ──────────────────────────────────────────
router.get("/users", protect, getAllUsers);

// ─── PROTECTED — superAdmin only ─────────────────────────────────────────────
router.post("/register", protect, authorizeRoles("superAdmin"), registerUser);
router.put("/update/:id", protect, authorizeRoles("superAdmin"), updateUser);
router.delete("/delete/:id", protect, authorizeRoles("superAdmin"), deleteUser);

export default router;