import Client from "../models/Client.js";
import { uploadToS3, getSignedFileUrl } from "./s3Service.js";
import { generateNextCode } from "../utils/generateCode.js";
import { buildScopeFilter } from "../utils/permissionScope.js";

// ─── HELPER: strip frontend-only `id` from subdocs ────────────────────────────
const stripFrontendIds = (arr = []) => arr.map(({ id, ...rest }) => rest);

// ─── HELPER: enforce record-level scope ───────────────────────────────────────
// requirePermission (route middleware) only checks that the permission value
// isn't "none" — it has no idea which record is being touched. This is the
// piece that actually compares a SPECIFIC record's createdBy against the
// caller's resolved scope (own / team / hierarchy / all) for a given action.
//
// Throws a 403 error if the record falls outside the caller's scope.
// Does nothing (record allowed) if scope resolves to "all", or if the
// record's owner is inside the allowed id list.
const ensureClientInScope = async (currentUser, action, client) => {
    const scopeFilter = await buildScopeFilter(currentUser, "clients", action);

    // false → permission is "none"/unconfigured. requirePermission should
    // already have blocked this, but fail closed here too defensively.
    if (scopeFilter === false) {
        const err = new Error("Access denied");
        err.statusCode = 403;
        throw err;
    }

    // null → scope is "all", no restriction to apply
    if (scopeFilter === null) return;

    const allowedIds = scopeFilter.createdBy.$in.map((id) => id.toString());
    // const ownerId = client.createdBy?.toString();

    // client.createdBy may be a populated sub-document ({ _id, username })
    // or a bare ObjectId, depending on which service function called this.
    // Normalize to a plain id string either way.
    const ownerId = (client.createdBy?._id ?? client.createdBy)?.toString();

        // ── TEMP DEBUG ──────────────────────────────────────────────
        // console.log("DEBUG action:", action);
        // console.log("DEBUG currentUser._id:", currentUser._id?.toString());
        // console.log("DEBUG client.createdBy (ownerId):", ownerId);
        // console.log("DEBUG allowedIds:", allowedIds);
        // ─────────────────────────────────────────────────────────────
 
    if (!ownerId || !allowedIds.includes(ownerId)) {
        const err = new Error("You do not have permission to modify this record");
        err.statusCode = 403;
        throw err;
    }
};

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
    const scopeFilter = await buildScopeFilter(currentUser, "clients", "view");

    if (scopeFilter === false) return [];

    const query = scopeFilter ?? {};

    return await Client.find(query)
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
        .sort({ createdAt: -1 });
};

// ─── GET CLIENT BY ID (scoped) ────────────────────────────────────────────────
// Previously had no scope check at all — any authenticated user with a
// non-"none" view permission could fetch ANY client by id, regardless of
// "own"/"team"/"hierarchy" scoping (the scoping only applied to the list
// endpoint). Now enforced consistently with the list.
export const getClientByIdService = async (id, currentUser) => {
    const client = await Client.findById(id)
        .populate("createdBy", "username")
        .populate("updatedBy", "username");

    if (!client) {
        const err = new Error("Client not found");
        err.statusCode = 404;
        throw err;
    }

    await ensureClientInScope(currentUser, "view", client);

    return client;
};

// ─── UPDATE CLIENT (scoped) ───────────────────────────────────────────────────
export const updateClientService = async (id, payload, currentUser) => {
    const existingClient = await Client.findById(id);

    if (!existingClient) {
        const err = new Error("Client not found");
        err.statusCode = 404;
        throw err;
    }

    // Enforce edit scope BEFORE applying any changes — this is the check
    // that was missing entirely, which let a "team"-scoped edit permission
    // update any client system-wide.
    await ensureClientInScope(currentUser, "edit", existingClient);

    const updates = { ...payload };

    if (Array.isArray(updates.locations)) updates.locations = stripFrontendIds(updates.locations);
    if (Array.isArray(updates.pocs))      updates.pocs      = stripFrontendIds(updates.pocs);
    updates.updatedBy = currentUser._id;

    const client = await Client.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });

    return client;
};

// ─── DELETE CLIENT (scoped) ───────────────────────────────────────────────────
export const deleteClientService = async (id, currentUser) => {
    const existingClient = await Client.findById(id);

    if (!existingClient) {
        const err = new Error("Client not found");
        err.statusCode = 404;
        throw err;
    }

    await ensureClientInScope(currentUser, "delete", existingClient);

    await Client.findByIdAndDelete(id);

    return existingClient;
};

// ─── GET CLIENT DOCUMENT URL ──────────────────────────────────────────────────
export const getClientDocumentUrlService = async (clientId, documentId) => {
    const client = await Client.findById(clientId);
    if (!client) throw new Error("Client not found");

    const document = client.documents.id(documentId);
    if (!document) throw new Error("Document not found");

    return await getSignedFileUrl(document.key);
};