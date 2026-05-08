import express from "express";
import {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient,
} from "../controllers/clientController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { createClientRules,updateClientRules, validate } from "../validators/clientValidator.js";

const router = express.Router();

// ─── PROTECTED — superAdmin + admin only ─────────────────────────────────────
router.post(
    "/",
    protect,
    authorizeRoles("superAdmin", "admin"),
    createClientRules,
    validate,
    createClient
);

router.get("/", protect, authorizeRoles("superAdmin", "admin"), getAllClients);
router.get("/:id", protect, authorizeRoles("superAdmin", "admin"), getClientById);

router.put(
    "/:id",
    protect,
    authorizeRoles("superAdmin", "admin"),
    updateClientRules,
    validate,
    updateClient
);

router.delete("/:id", protect, authorizeRoles("superAdmin", "admin"), deleteClient);

export default router;