import Client from "../models/Client.js";

// ─── HELPER: strip frontend-only `id` from subdocs ────────────────────────────
const stripFrontendIds = (arr = []) =>
    arr.map(({ id, ...rest }) => rest);

// ─── CREATE CLIENT ────────────────────────────────────────────────────────────
export const createClientService = async (payload, userId) => {
    const data = {
        ...payload,
        locations: stripFrontendIds(payload.locations),
        pocs:      stripFrontendIds(payload.pocs),
        documents: [],   // Phase 2 — Cloudinary later
        createdBy: userId,
    };
    return await Client.create(data);
};

// ─── GET ALL CLIENTS ──────────────────────────────────────────────────────────
export const getAllClientsService = async () => {
    return await Client.find()
        .populate("createdBy", "username role")
        .sort({ createdAt: -1 });
};

// ─── GET CLIENT BY ID ─────────────────────────────────────────────────────────
export const getClientByIdService = async (id) => {
    const client = await Client.findById(id)
        .populate("createdBy", "username role");
    if (!client) {
        const err = new Error("Client not found");
        err.statusCode = 404;
        throw err;
    }
    return client;
};

// ─── UPDATE CLIENT ────────────────────────────────────────────────────────────
export const updateClientService = async (id, payload) => {
    const updates = { ...payload };
    if (Array.isArray(updates.locations)) updates.locations = stripFrontendIds(updates.locations);
    if (Array.isArray(updates.pocs))      updates.pocs      = stripFrontendIds(updates.pocs);

    const client = await Client.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });
    if (!client) {
        const err = new Error("Client not found");
        err.statusCode = 404;
        throw err;
    }
    return client;
};

// ─── DELETE CLIENT ────────────────────────────────────────────────────────────
export const deleteClientService = async (id) => {
    const client = await Client.findByIdAndDelete(id);
    if (!client) {
        const err = new Error("Client not found");
        err.statusCode = 404;
        throw err;
    }
    return client;
};