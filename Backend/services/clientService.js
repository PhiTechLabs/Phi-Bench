import Client from "../models/Client.js";
import { uploadToS3, getSignedFileUrl } from "./s3Service.js";
import { generateNextCode } from "../utils/generateCode.js";
import { buildScopeFilter  } from "../utils/permissionScope.js";

// ─── HELPER: strip frontend-only `id` from subdocs ────────────────────────────
const stripFrontendIds = (arr = []) => arr.map(({ id, ...rest }) => rest);

// ─── CREATE CLIENT ────────────────────────────────────────────────────────────
export const createClientService = async (payload, files, userId) => {
    const documents = [];

    if (files?.documents?.length) {
        for (const file of files.documents) {
            const uploaded = await uploadToS3(file, "clients/documents");
            documents.push({
                name:       file.originalname,
                url:        uploaded.url,
                key:        uploaded.key,
                uploadedAt: new Date(),
            });
        }
    }

    const code = await generateNextCode("client");

    return await Client.create({
        ...payload,
        code,
        locations: stripFrontendIds(payload.locations),
        pocs:      stripFrontendIds(payload.pocs),
        documents,
        createdBy: userId,
    });
};

// ─── GET ALL CLIENTS (scoped) ─────────────────────────────────────────────────
// Applies the same hierarchy-aware scope as all other list endpoints.
// A recruiter with "own" access sees only clients they personally added.
// A manager with "hierarchy" access sees clients added by their whole subtree.
export const getAllClientsService = async (currentUser) => {
    const scopeFilter = await buildScopeFilter(currentUser, "clients");

    if (scopeFilter === false) return [];

    const query = scopeFilter ?? {};

    return await Client.find(query)
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
        .sort({ createdAt: -1 });
};

// ─── GET CLIENT BY ID ─────────────────────────────────────────────────────────
export const getClientByIdService = async (id) => {
    const client = await Client.findById(id)
        .populate("createdBy", "username")
        .populate("updatedBy", "username");

    if (!client) {
        const err = new Error("Client not found");
        err.statusCode = 404;
        throw err;
    }
    return client;
};

// ─── UPDATE CLIENT ────────────────────────────────────────────────────────────
export const updateClientService = async (id, payload, userId) => {
    const updates = { ...payload };

    if (Array.isArray(updates.locations)) updates.locations = stripFrontendIds(updates.locations);
    if (Array.isArray(updates.pocs))      updates.pocs      = stripFrontendIds(updates.pocs);
    if (userId) updates.updatedBy = userId;

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

// ─── GET CLIENT DOCUMENT URL ──────────────────────────────────────────────────
export const getClientDocumentUrlService = async (clientId, documentId) => {
    const client = await Client.findById(clientId);
    if (!client) throw new Error("Client not found");

    const document = client.documents.id(documentId);
    if (!document) throw new Error("Document not found");

    return await getSignedFileUrl(document.key);
};