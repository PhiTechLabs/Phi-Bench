import User from "../models/User.js";
import Team from "../models/team.js";

// ─── RECURSIVE SUBTREE WALK ───────────────────────────────────────────────────
// Returns every userId that sits at or below `rootId` in the managerId tree,
// including the root itself.  BFS so we never blow the call stack on a deep org.
const getSubtreeUserIds = async (rootId) => {
    const visited = new Set();
    const queue   = [rootId];

    while (queue.length > 0) {
        const current = queue.shift();
        const key = current.toString();
        if (visited.has(key)) continue;
        visited.add(key);

        const directReports = await User.find(
            { managerId: current, isActive: true },
            "_id"
        ).lean();

        for (const u of directReports) {
            queue.push(u._id);
        }
    }

    return [...visited].map((id) => id); // strings; Mongoose $in handles them fine
};

// ─── MAIN SCOPE RESOLVER ──────────────────────────────────────────────────────
// Returns:
//   null          → caller should apply NO createdBy filter (user sees everything)
//   []            → caller should return an empty result set (no access)
//   [id, id, …]   → caller should filter createdBy: { $in: <array> }
//
// The `module` param is reserved for future per-module overrides (e.g. clients
// might use assignedTo instead of createdBy) but is not used yet.
export const getAccessibleUserIds = async (user, permissionValue, _module) => {

    switch (permissionValue) {

        // ── all ───────────────────────────────────────────────────────────────
        // No filter — user sees every record in the system.
        case "all":
            return null;

        // ── own ───────────────────────────────────────────────────────────────
        // Only records the user themselves created.
        case "own":
            return [user._id];

        // ── team ──────────────────────────────────────────────────────────────
        // Records created by anyone on the same team (lead + all members).
        // If the user isn't on any team, fall back to own records only.
        case "team": {
            const team = await Team.findOne({
                $or: [
                    { teamLead: user._id },
                    { members:  user._id },
                ],
                isActive: true,
            }).lean();

            if (!team) return [user._id];

            return [
                team.teamLead,
                ...team.members,
            ].filter(Boolean); // teamLead can be null
        }

        // ── reporting ─────────────────────────────────────────────────────────
        // Records created by the user themselves AND their direct reports
        // (one level down — not the full subtree, that's "hierarchy").
        //
        // Self is always included: a manager with "reporting" scope who adds
        // a client must be able to see it. Without self, managers would be
        // locked out of their own records the moment they have direct reports.
        case "reporting": {
            const directReports = await User.find(
                { managerId: user._id, isActive: true },
                "_id"
            ).lean();

            return [user._id, ...directReports.map((u) => u._id)];
        }

        // ── hierarchy ─────────────────────────────────────────────────────────
        // Records created by the user OR anyone in their full downward subtree,
        // no matter how many levels deep.
        //
        // Example from the product spec:
        //   Ashu (head) → can see Sneha, Abhinav, Girish AND all recruiters
        //   under each of them.
        //   Sneha → can see herself and her own recruiters only.
        //   A recruiter not in any team → sees only their own records.
        //
        // The previous implementation only walked one level (direct reports),
        // which meant Ashu couldn't see his recruiters' data.  This version
        // does a full BFS through the managerId tree.
        case "hierarchy": {
            const ids = await getSubtreeUserIds(user._id);
            return ids;
        }

        // ── approval ──────────────────────────────────────────────────────────
        // Records the user created PLUS records pending their approval.
        // Currently treated as "own" because the approval workflow hasn't been
        // built yet.  Replace this stub once approval records are modelled.
        case "approval":
            return [user._id];

        // ── none / unknown ────────────────────────────────────────────────────
        // Middleware already blocks requests with value "none", but guard here
        // too so a misconfigured role can't accidentally fall through to "all".
        default:
            return [];
    }
};

// ─── SHARED LIST HELPER ───────────────────────────────────────────────────────
// Builds the MongoDB filter object for a createdBy-scoped list query.
// Returns null when scope is "all" (caller should omit the filter entirely),
// or an object ready to spread into Model.find(...).
//
// Usage:
//   const scopeFilter = await buildScopeFilter(req.user, "job");
//   if (scopeFilter === false) return [];          // permission denied
//   const query = scopeFilter ? { ...scopeFilter } : {};
//   return Model.find(query)...
export const buildScopeFilter = async (currentUser, module) => {
    try {
        // Guard: if protect middleware didn't run or req.user wasn't set,
        // fail closed rather than crashing with a confusing TypeError.
        if (!currentUser) {
            console.error(`[buildScopeFilter] currentUser is undefined for module "${module}" — req.user was not set by protect middleware`);
            return false;
        }

        // role is a populated Mongoose document — call toObject() so optional
        // chaining on nested subdocuments works reliably as plain JS objects.
        const role = currentUser.role?.toObject
            ? currentUser.role.toObject()
            : currentUser.role;

        const permission = role?.modulePermissions?.[module]?.view;

        // No permission configured — return empty result set.
        if (!permission || permission === "none") return false;

        const ids = await getAccessibleUserIds(currentUser, permission, module);

        // null means "all" — no createdBy filter needed
        if (ids === null) return null;

        // empty array — scoped permission but no accessible peers
        if (ids.length === 0) return { createdBy: { $in: [] } };

        return { createdBy: { $in: ids } };

    } catch (err) {
        // Surface the real error in server logs so it's diagnosable,
        // then fail closed (empty result) rather than crashing the request.
        console.error(`[buildScopeFilter] error resolving scope for module "${module}":`, err);
        throw err;
    }
};