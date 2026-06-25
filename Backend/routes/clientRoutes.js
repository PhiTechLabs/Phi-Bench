import express from "express";
import upload from "../middleware/uploadMiddleware.js";

import {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient,
    getClientDocumentUrl
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

    upload.fields([
        {
            name: "documents",
            maxCount: 20,
        },
    ]),

    // Parse multipart JSON fields
    (req, res, next) => {

        try {

            if (req.body.locations) {
                req.body.locations =
                    JSON.parse(req.body.locations);
            }

            if (req.body.pocs) {
                req.body.pocs =
                    JSON.parse(req.body.pocs);
            }

        } catch (err) {

            return res.status(400).json({
                message:
                    "Invalid locations/pocs JSON",
            });
        }

        next();
    },

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
    "/:clientId/documents/:documentId",
    protect,
    requirePermission("clients", "view"),
    getClientDocumentUrl
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