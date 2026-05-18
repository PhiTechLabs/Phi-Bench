import express from "express";

import {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient,
} from "../controllers/clientController.js";

import { protect } from "../middleware/authMiddleware.js";

import { requirePermission } from "../middleware/permissionMiddleware.js";

import {
    createClientRules,
    updateClientRules,
    validate
} from "../validators/clientValidator.js";

import { PERMISSIONS } from "../config/permissions.js";

const router = express.Router();

router.post(
    "/",
    protect,
    requirePermission(PERMISSIONS.CLIENT_CREATE),
    createClientRules,
    validate,
    createClient
);

router.get(
    "/",
    protect,
    requirePermission(PERMISSIONS.CLIENT_VIEW),
    getAllClients
);

router.get(
    "/:id",
    protect,
    requirePermission(PERMISSIONS.CLIENT_VIEW),
    getClientById
);

router.put(
    "/:id",
    protect,
    requirePermission(PERMISSIONS.CLIENT_EDIT),
    updateClientRules,
    validate,
    updateClient
);

router.delete(
    "/:id",
    protect,
    requirePermission(PERMISSIONS.CLIENT_DELETE),
    deleteClient
);

export default router;