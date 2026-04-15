import express from "express";
import { loginUser } from "../controllers/authController.js";
import { registerUser } from "../controllers/authController.js";
import { updateUser } from "../controllers/authController.js";
import { deleteUser } from "../controllers/authController.js";
import { getAllUsers } from "../controllers/authController.js";

const router = express.Router();

router.get("/users", getAllUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);

export default router;