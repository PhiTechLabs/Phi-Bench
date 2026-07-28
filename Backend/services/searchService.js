import Job       from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import Client    from "../models/Client.js";
import User      from "../models/User.js";
import { buildScopeFilter, getAccessibleUserIds } from "../utils/permissionScope.js";
import { CODE_PREFIXES } from "../utils/generateCode.js";

// ─── GLOBAL SEARCH ────────────────────────────────────────────────────────────
// Navbar search bar — searches jobs, candidates, and clients at once.
//
// Scoping: every entity type is filtered the same way its list page is, so
// search can never surface a record the user couldn't see on the list.
//   - candidates : scoped by candidate.view permission (was already done)
//   - jobs       : scoped by job.view permission       (now wired)
//   - clients    : scoped by clients.view permission   (now wired)
//
// Returns a flat list of lightweight result objects tagged with `entityType`.
const CODE_PATTERN = /^(JC|CD|CL)-?(\d+)$/i;

export const globalSearchService = async (rawQuery, currentUser, limit = 8) => {
    const query = (rawQuery || "").trim().slice(0, 100);
    if (!query) return [];

    // Resolve all three scopes in parallel — one DB round-trip per scope type
    // rather than one per entity after the other.
    const [candidateScope, jobScopeFilter, clientScopeFilter] = await Promise.all([
        getAccessibleCandidateScope(currentUser),
        buildScopeFilter(currentUser, "job"),
        buildScopeFilter(currentUser, "clients"),
    ]);

    // buildScopeFilter returns:
    //   false  → no view permission   → exclude this entity type entirely
    //   null   → "all" scope          → no createdBy filter
    //   object → { createdBy: {...} } → merge into query filter

    const codeMatch = query.match(CODE_PATTERN);

    // ── CASE 1: looks like a full entity code (JC001, CD014, CL003) ──────────
    if (codeMatch) {
        const [, prefix, digits] = codeMatch;
        const normalizedPrefix = prefix.toUpperCase();
        const codeRegex = new RegExp(`^${normalizedPrefix}0*${digits}$`, "i");

        if (normalizedPrefix === CODE_PREFIXES.job) {
            if (jobScopeFilter === false) return [];
            return await searchJobs(
                applyScope({ code: codeRegex }, jobScopeFilter),
                limit
            );
        }
        if (normalizedPrefix === CODE_PREFIXES.candidate) {
            if (!candidateScope) return [];
            return await searchCandidates(
                applyCandidateScope({ code: codeRegex }, candidateScope),
                limit
            );
        }
        if (normalizedPrefix === CODE_PREFIXES.client) {
            if (clientScopeFilter === false) return [];
            return await searchClients(
                applyScope({ code: codeRegex }, clientScopeFilter),
                limit
            );
        }
    }

    // ── CASE 2: free-text — search across all three entity types ─────────────
    const textRegex = new RegExp(
        query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
    );

    const [jobs, candidates, clients] = await Promise.all([

        jobScopeFilter !== false
            ? searchJobs(
                applyScope(
                    { $or: [{ title: textRegex }, { code: textRegex }] },
                    jobScopeFilter
                ),
                limit
            )
            : Promise.resolve([]),

        candidateScope
            ? searchCandidates(
                applyCandidateScope(
                    {
                        $or: [
                            { firstName: textRegex },
                            { lastName:  textRegex },
                            { email:     textRegex },
                            { code:      textRegex },
                        ],
                    },
                    candidateScope
                ),
                limit
            )
            : Promise.resolve([]),

        clientScopeFilter !== false
            ? searchClients(
                applyScope(
                    { $or: [{ clientName: textRegex }, { code: textRegex }] },
                    clientScopeFilter
                ),
                limit
            )
            : Promise.resolve([]),
    ]);

    return [...jobs, ...candidates, ...clients]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
};

// ─── SCOPE HELPERS ────────────────────────────────────────────────────────────

// Generic: merges a buildScopeFilter result into an existing Mongoose filter.
// null  → "all", return the filter unchanged
// object → merge the createdBy constraint in
const applyScope = (filter, scopeFilter) => {
    if (!scopeFilter) return filter;              // null = "all"
    return { ...filter, ...scopeFilter };
};

// Candidate scope uses the legacy getAccessibleUserIds path because
// searchCandidates was already built around it and the shape is slightly
// different (returns "all" string vs null).
const getAccessibleCandidateScope = async (currentUser) => {
    const viewPermission = currentUser?.role?.modulePermissions?.candidate?.view;
    if (!viewPermission || viewPermission === "none") return null;
    if (viewPermission === "all") return "all";
    return await getAccessibleUserIds(currentUser, viewPermission);
};

const applyCandidateScope = (filter, scope) => {
    if (scope === "all") return filter;
    return { ...filter, createdBy: { $in: scope } };
};

// ─── PER-ENTITY DB HELPERS ────────────────────────────────────────────────────

const searchJobs = async (filter, limit) => {
    const jobs = await Job.find(filter)
        .select("code title client status createdAt")
        .sort({ createdAt: -1 })
        .limit(limit);

    return jobs.map((j) => ({
        entityType: "job",
        id:         j._id,
        code:       j.code,
        title:      j.title,
        subtitle:   j.client,
        meta:       j.status,
        createdAt:  j.createdAt,
    }));
};

const searchCandidates = async (filter, limit) => {
    const candidates = await Candidate.find(filter)
        .select("code firstName lastName email status createdAt")
        .sort({ createdAt: -1 })
        .limit(limit);

    return candidates.map((c) => ({
        entityType: "candidate",
        id:         c._id,
        code:       c.code,
        title:      [c.firstName, c.lastName].filter(Boolean).join(" "),
        subtitle:   c.email,
        meta:       c.status,
        createdAt:  c.createdAt,
    }));
};

const searchClients = async (filter, limit) => {
    const clients = await Client.find(filter)
        .select("code clientName industry status createdAt")
        .sort({ createdAt: -1 })
        .limit(limit);

    return clients.map((c) => ({
        entityType: "client",
        id:         c._id,
        code:       c.code,
        title:      c.clientName,
        subtitle:   c.industry,
        meta:       c.status,
        createdAt:  c.createdAt,
    }));
};