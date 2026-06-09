import express from "express";

import {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient,
} from "../controllers/clientController.js";

import { protect } from "../middleware/authMiddleware.js";

import {
    createClientRules,
    updateClientRules,
    validate,
} from "../validators/clientValidator.js";

import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    requirePermission("clients", "add"),
    createClientRules,
    validate,
    createClient
);

router.get(
    "/",
    protect,
    requirePermission("clients", "view"),
    getAllClients
);

router.get(
    "/:id",
    protect,
    requirePermission("clients", "view"),
    getClientById
);

router.put(
    "/:id",
    protect,
    requirePermission("clients", "edit"),
    updateClientRules,
    validate,
    updateClient
);

router.delete(
    "/:id",
    protect,
    requirePermission("clients", "delete"),
    deleteClient
);

export default router;