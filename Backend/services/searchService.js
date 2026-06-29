import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import Client from "../models/Client.js";
import User from "../models/User.js";
import { getAccessibleUserIds } from "../utils/permissionScope.js";
import { CODE_PREFIXES } from "../utils/generateCode.js";

// ─── GLOBAL SEARCH ────────────────────────────────────────────────────────────
// Used by the navbar's search bar (distinct from each DataTable's own local
// search, which only filters rows already loaded for that one table). This
// hits the database directly and searches across all three entities at once.
//
// Matches on:
//   - exact/partial reference code (JC001, CD014, CL003 — case-insensitive,
//     and tolerant of the user typing without the leading letters, e.g. "014")
//   - candidate name / job title / client name (partial, case-insensitive)
//
// Permission scoping: candidate results are filtered the same way
// listCandidatesService filters the Candidates list page — a search can
// never surface a candidate the user couldn't otherwise see. Job and client
// results are NOT scoped here, because they aren't scoped anywhere else in
// the app today (getAllJobsService / getAllClientsService return everything
// to any authenticated user) — this matches existing behavior rather than
// quietly changing it. Worth tightening in both places together later.
//
// Returns a flat list of lightweight result objects the frontend can render
// directly and navigate from, each tagged with `entityType` so the UI knows
// which detail route to send the user to.
const CODE_PATTERN = /^(JC|CD|CL)-?(\d+)$/i;

export const globalSearchService = async (rawQuery, userId, limit = 8) => {
    const query = (rawQuery || "").trim().slice(0, 100);

    if (!query) return [];

    const accessibleCandidateUserIds = await getAccessibleCandidateScope(userId);
    // null means "no candidate access at all" — every candidate search
    // branch below must respect this.

    const codeMatch = query.match(CODE_PATTERN);

    // ─── CASE 1: looks like a full code (e.g. "CD014", "jc1") ─────────────────
    // Go straight to the matching entity type instead of querying all three —
    // a code's prefix unambiguously tells us which collection to search.
    if (codeMatch) {
        const [, prefix, digits] = codeMatch;
        const normalizedPrefix = prefix.toUpperCase();
        // Match the code loosely on the numeric part so "CD14" still finds
        // "CD014" — codes are zero-padded to 3 digits but we don't want the
        // search to depend on the user typing the padding exactly right.
        const codeRegex = new RegExp(`^${normalizedPrefix}0*${digits}$`, "i");

        if (normalizedPrefix === CODE_PREFIXES.job) {
            return await searchJobs({ code: codeRegex }, limit);
        }
        if (normalizedPrefix === CODE_PREFIXES.candidate) {
            if (!accessibleCandidateUserIds) return [];
            return await searchCandidates(
                applyCandidateScope({ code: codeRegex }, accessibleCandidateUserIds),
                limit
            );
        }
        if (normalizedPrefix === CODE_PREFIXES.client) {
            return await searchClients({ code: codeRegex }, limit);
        }
    }

    // ─── CASE 2: free text — search name/title across all three, plus also
    // try it as a loose code fragment in case the user typed e.g. just
    // digits ("014") without a prefix ────────────────────────────────────────
    const textRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const [jobs, candidates, clients] = await Promise.all([
        searchJobs({ $or: [{ title: textRegex }, { code: textRegex }] }, limit),
        accessibleCandidateUserIds
            ? searchCandidates(
                  applyCandidateScope(
                      {
                          $or: [
                              { firstName: textRegex },
                              { lastName: textRegex },
                              { email: textRegex },
                              { code: textRegex },
                          ],
                      },
                      accessibleCandidateUserIds
                  ),
                  limit
              )
            : Promise.resolve([]),
        searchClients({ $or: [{ clientName: textRegex }, { code: textRegex }] }, limit),
    ]);

    // Interleave results from all three rather than dumping one entity type
    // first — relevance here is "most recently created", consistently
    // across the merged list.
    return [...jobs, ...candidates, ...clients]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
};

// ─── CANDIDATE SCOPE HELPERS ──────────────────────────────────────────────────
// Returns "all" (no extra filter needed), an array of accessible user ids
// (filter to createdBy: $in [...]), or null (no candidate access at all —
// caller must return [] for any candidate branch).
const getAccessibleCandidateScope = async (userId) => {
    const user = await User.findById(userId).populate("roleId");
    const viewPermission = user?.roleId?.modulePermissions?.candidate?.view;

    if (!viewPermission || viewPermission === "none") return null;
    if (viewPermission === "all") return "all";

    return await getAccessibleUserIds(user, viewPermission);
};

const applyCandidateScope = (filter, scope) => {
    if (scope === "all") return filter;
    return { ...filter, createdBy: { $in: scope } };
};

// ─── PER-ENTITY HELPERS (shape each result the same way for the frontend) ────

const searchJobs = async (filter, limit) => {
    const jobs = await Job.find(filter)
        .select("code title client status createdAt")
        .sort({ createdAt: -1 })
        .limit(limit);

    return jobs.map((j) => ({
        entityType: "job",
        id: j._id,
        code: j.code,
        title: j.title,
        subtitle: j.client,
        meta: j.status,
        createdAt: j.createdAt,
    }));
};

const searchCandidates = async (filter, limit) => {
    const candidates = await Candidate.find(filter)
        .select("code firstName lastName email status createdAt")
        .sort({ createdAt: -1 })
        .limit(limit);

    return candidates.map((c) => ({
        entityType: "candidate",
        id: c._id,
        code: c.code,
        title: [c.firstName, c.lastName].filter(Boolean).join(" "),
        subtitle: c.email,
        meta: c.status,
        createdAt: c.createdAt,
    }));
};

const searchClients = async (filter, limit) => {
    const clients = await Client.find(filter)
        .select("code clientName industry status createdAt")
        .sort({ createdAt: -1 })
        .limit(limit);

    return clients.map((c) => ({
        entityType: "client",
        id: c._id,
        code: c.code,
        title: c.clientName,
        subtitle: c.industry,
        meta: c.status,
        createdAt: c.createdAt,
    }));
};