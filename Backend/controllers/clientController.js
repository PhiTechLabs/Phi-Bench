import asyncHandler from "express-async-handler";
import {
    createClientService,
    getAllClientsService,
    getClientByIdService,
    updateClientService,
    deleteClientService,
    getClientDocumentUrlService
} from "../services/clientService.js";

// ─── CREATE CLIENT ────────────────────────────────────────────────────────────
export const createClient = asyncHandler(async (req, res) => {

    const client =
        await createClientService(
            req.body,
            req.files,
            req.user.id
        );
    res.status(201).json({
        message: "Client created successfully",
        client,
    });
});

// ─── GET ALL CLIENTS ──────────────────────────────────────────────────────────
export const getAllClients = asyncHandler(async (req, res) => {
    try {
        const clients = await getAllClientsService(req.user);
        res.json({ count: clients.length, clients });
    } catch (err) {
        // Temporary diagnostic catch — surfaces the real error message so we
        // can identify what's throwing instead of seeing a generic 500.
        // Remove once root cause is confirmed and fixed.
        console.error("[getAllClients] REAL ERROR:", err.message, err.stack);
        res.status(500).json({
            message: err.message,
            stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
        });
    }
});

// ─── GET CLIENT BY ID ─────────────────────────────────────────────────────────
export const getClientById = asyncHandler(async (req, res) => {
    const client = await getClientByIdService(req.params.id);
    res.json({ client });
});

// ─── UPDATE CLIENT ────────────────────────────────────────────────────────────
export const updateClient = asyncHandler(async (req, res) => {
    const client = await updateClientService(req.params.id, req.body, req.user.id);
    res.json({ message: "Client updated successfully", client });
});

// ─── DELETE CLIENT ────────────────────────────────────────────────────────────
export const deleteClient = asyncHandler(async (req, res) => {
    await deleteClientService(req.params.id);
    res.json({ message: "Client deleted successfully" });
});

export const getClientDocumentUrl =
    asyncHandler(async (req, res) => {

        const url =
            await getClientDocumentUrlService(
                req.params.clientId,
                req.params.documentId
            );

        res.json({ url });
    });