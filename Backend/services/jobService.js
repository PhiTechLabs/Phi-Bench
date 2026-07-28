import Job    from "../models/Job.js";
import Client from "../models/Client.js";
import { generateNextCode } from "../utils/generateCode.js";
import { buildScopeFilter  } from "../utils/permissionScope.js";

// ─── HELPER: look up a client by id and return its name ──────────────────────
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
    const code   = await generateNextCode("job");

    return await Job.create({
        ...payload,
        code,
        clientId:  client._id,
        client:    client.clientName,
        createdBy: userId,
    });
};

// ─── GET ALL JOBS (scoped) ────────────────────────────────────────────────────
// Returns only the jobs the requesting user is permitted to see, based on the
// view scope configured for their role on the "job" module:
//
//   "all"       → every job (no filter)
//   "hierarchy" → jobs created by the user and their full downward subtree
//                 (e.g. Ashu sees his own jobs + Sneha's + all their recruiters')
//   "team"      → jobs created by anyone on the same team
//   "reporting" → jobs created by the user's direct reports
//   "own"       → only jobs the user themselves created
//
// Returns [] when permission is "none" or the scope resolves to an empty set.
export const getAllJobsService = async (currentUser) => {
    const scopeFilter = await buildScopeFilter(currentUser, "job");

    // buildScopeFilter returns false when the user has no view permission at all
    if (scopeFilter === false) return [];

    // null means "all" — omit the filter
    const query = scopeFilter ?? {};

    return await Job.find(query)
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
        .sort({ createdAt: -1 });
};

// ─── GET JOB BY ID ────────────────────────────────────────────────────────────
export const getJobByIdService = async (id) => {
    const job = await Job.findById(id)
        .populate("createdBy", "username")
        .populate("updatedBy", "username");

    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }
    return job;
};

// ─── UPDATE JOB ───────────────────────────────────────────────────────────────
export const updateJobService = async (id, payload, userId) => {
    const updates = { ...payload };

    if (updates.clientId !== undefined) {
        const client      = await resolveClient(updates.clientId);
        updates.clientId  = client._id;
        updates.client    = client.clientName;
    }

    if (userId) updates.updatedBy = userId;

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