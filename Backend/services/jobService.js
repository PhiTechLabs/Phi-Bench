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

// ─── HELPER: enforce record-level scope ───────────────────────────────────────
// requirePermission (route middleware) only checks that the permission value
// isn't "none" — it has no idea which record is being touched. This compares
// a SPECIFIC job's createdBy against the caller's resolved scope (own / team /
// hierarchy / all) for a given action ("view", "edit", "delete").
//
// Throws a 403 error if the record falls outside the caller's scope.
// Does nothing (record allowed) if scope resolves to "all", or if the
// record's owner is inside the allowed id list.
const ensureJobInScope = async (currentUser, action, job) => {
    const scopeFilter = await buildScopeFilter(currentUser, "job", action);

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

    // job.createdBy may be a populated sub-document ({ _id, username })
    // or a bare ObjectId, depending on which service function called this
    // (getJobByIdService populates it; update/delete fetch it raw).
    // Normalize to a plain id string either way.
    const ownerId = (job.createdBy?._id ?? job.createdBy)?.toString();

    if (!ownerId || !allowedIds.includes(ownerId)) {
        const err = new Error("You do not have permission to modify this record");
        err.statusCode = 403;
        throw err;
    }
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
    const scopeFilter = await buildScopeFilter(currentUser, "job", "view");

    // buildScopeFilter returns false when the user has no view permission at all
    if (scopeFilter === false) return [];

    // null means "all" — omit the filter
    const query = scopeFilter ?? {};

    return await Job.find(query)
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
        .sort({ createdAt: -1 });
};

// ─── GET JOB BY ID (scoped) ───────────────────────────────────────────────────
// Previously had no scope check at all — any authenticated user with a
// non-"none" view permission could fetch ANY job by id, regardless of
// "own"/"team"/"hierarchy" scoping (the scoping only applied to the list
// endpoint). Now enforced consistently with the list.
export const getJobByIdService = async (id, currentUser) => {
    const job = await Job.findById(id)
        .populate("createdBy", "username")
        .populate("updatedBy", "username");

    if (!existingJob) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }

    await ensureJobInScope(currentUser, "view", job);

    return job;
};

// ─── UPDATE JOB (scoped) ──────────────────────────────────────────────────────
export const updateJobService = async (id, payload, currentUser) => {
    const existingJob = await Job.findById(id);

    if (!existingJob) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }

    // Enforce edit scope BEFORE applying any changes — this is the check
    // that was missing entirely, which let a scoped "edit" permission
    // (e.g. team-only) update any job system-wide.
    await ensureJobInScope(currentUser, "edit", existingJob);

    const updates = { ...payload };

    if (updates.clientId !== undefined) {
        const client      = await resolveClient(updates.clientId);
        updates.clientId  = client._id;
        updates.client    = client.clientName;
    }

    updates.updatedBy = currentUser._id;

    const job = await Job.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });

    return job;
};

// ─── DELETE JOB (scoped) ──────────────────────────────────────────────────────
export const deleteJobService = async (id, currentUser) => {
    const existingJob = await Job.findById(id);

    if (!existingJob) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }

    await ensureJobInScope(currentUser, "delete", existingJob);

    await Job.findByIdAndDelete(id);

    return existingJob;
};