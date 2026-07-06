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
    const clients = await getAllClientsService();
    res.json({ count: clients.length, clients });
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