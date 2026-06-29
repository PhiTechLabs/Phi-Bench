import Job from "../models/Job.js";
import Client from "../models/Client.js";
import { generateNextCode } from "../utils/generateCode.js";

// ─── HELPER: look up a client by id and return its name ──────────────────────
// The frontend sends clientId; we never trust a client-supplied "client" name
// string, we always re-derive it from the real Client record so a job can
// never end up referencing a client that doesn't exist (or showing a stale /
// spoofed name).
const resolveClient = async (clientId) => {
    if (!clientId) {
        const err = new Error("Client is required");
        err.statusCode = 400;
        throw err;
    }

    const client = await Client.findById(clientId);

    if (!client) {
        const err = new Error("Selected client does not exist");
        err.statusCode = 400;
        throw err;
    }

    return client;
};

// ─── CREATE JOB ───────────────────────────────────────────────────────────────
export const createJobService = async (payload, userId) => {
    const client = await resolveClient(payload.clientId);
    const code = await generateNextCode("job");

    const data = {
        ...payload,
        code,
        clientId: client._id,
        client:   client.clientName,
        createdBy: userId,
    };
    return await Job.create(data);
};

// ─── GET ALL JOBS ─────────────────────────────────────────────────────────────
export const getAllJobsService = async () => {
    return await Job.find()
        .populate("createdBy", "username role")
        .sort({ createdAt: -1 });
};

// ─── GET JOB BY ID ────────────────────────────────────────────────────────────
export const getJobByIdService = async (id) => {
    const job = await Job.findById(id)
        .populate("createdBy", "username role");
    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }
    return job;
};

// ─── UPDATE JOB ───────────────────────────────────────────────────────────────
export const updateJobService = async (id, payload) => {
    const updates = { ...payload };

    // Only re-resolve the client if the caller is actually changing it.
    // This keeps partial updates (e.g. just changing status) from requiring
    // clientId on every request.
    if (updates.clientId !== undefined) {
        const client = await resolveClient(updates.clientId);
        updates.clientId = client._id;
        updates.client   = client.clientName;
    }

    const job = await Job.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });
    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }
    return job;
};

// ─── DELETE JOB ───────────────────────────────────────────────────────────────
export const deleteJobService = async (id) => {
    const job = await Job.findByIdAndDelete(id);
    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }
    return job;
};