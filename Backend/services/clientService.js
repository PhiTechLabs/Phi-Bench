import Client from "../models/Client.js";
import {uploadToS3} from "../services/s3Service.js"
import { getSignedFileUrl } from "./s3Service.js";
import { generateNextCode } from "../utils/generateCode.js";
// ─── HELPER: strip frontend-only `id` from subdocs ────────────────────────────
const stripFrontendIds = (arr = []) =>
    arr.map(({ id, ...rest }) => rest);

// ─── CREATE CLIENT ────────────────────────────────────────────────────────────

export const createClientService = async (
    payload,
    files,
    userId
) => {

    const documents = [];

    if (files?.documents?.length) {
        for (const file of files.documents) {

            const uploaded = await uploadToS3(
                file,
                "clients/documents"
            );

            documents.push({
                name: file.originalname,
                url: uploaded.url,
                key: uploaded.key,
                uploadedAt: new Date(),
            });
        }
    }

    const code = await generateNextCode("client");

    const data = {
        ...payload,
        code,
        locations: stripFrontendIds(payload.locations),
        pocs: stripFrontendIds(payload.pocs),
        documents,          // <-- documents not document
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

        console.log(
    JSON.stringify(client.documents, null, 2)
);
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


export const getClientDocumentUrlService = async (
    clientId,
    documentId
) => {
    const client = await Client.findById(clientId);

    if (!client) {
        throw new Error("Client not found");
    }

    const document = client.documents.id(documentId);

    if (!document) {
        throw new Error("Document not found");
    }

    const signedUrl = await getSignedFileUrl(
        document.key
    );

    return signedUrl;
};