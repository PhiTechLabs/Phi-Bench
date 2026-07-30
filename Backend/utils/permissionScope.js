import User from "../models/User.js";
import Team from "../models/team.js";

export const getAccessibleUserIds = async (
    user,
    permissionValue
) => {

    switch (permissionValue) {

        case "all":
            return null;

        case "own":
            return [user._id];

        case "reporting": {
            const directReports =
                await User.find({
                    managerId: user._id,
                }).select("_id");

            return directReports.map(
                (u) => u._id
            );
        }

        case "team": {

            const team =
                await Team.findOne({
                    $or: [
                        { teamLead: user._id },
                        { members: user._id },
                    ],
                });

            if (!team) {
                return [user._id];
            }

            return [
                team.teamLead,
                ...team.members,
            ];
        }

        case "hierarchy": {

            const users =
                await User.find({
                    managerId: user._id,
                }).select("_id");

            return [
                user._id,
                ...users.map(
                    (u) => u._id
                ),
            ];
        }

        default:
            return [];
    }
};

// ─── SHARED LIST HELPER ───────────────────────────────────────────────────────
// Builds the MongoDB filter object for a createdBy-scoped list query.
// Returns null when scope is "all" (caller should omit the filter entirely),
// or an object ready to spread into Model.find(...).
//
// `action` selects WHICH permission field to scope by ("view", "edit", "add",
// "delete") — it previously always read `.view`, which meant a scoped "edit"
// permission (e.g. team-only) was never actually enforced on single-record
// update/delete calls. Defaults to "view" so existing call sites (list
// endpoints) don't need to change.
//
// Usage:
//   const scopeFilter = await buildScopeFilter(req.user, "job");           // view (default)
//   const scopeFilter = await buildScopeFilter(req.user, "clients", "edit"); // edit
//   if (scopeFilter === false) return [];          // permission denied
//   const query = scopeFilter ? { ...scopeFilter } : {};
//   return Model.find(query)...
export const buildScopeFilter = async (currentUser, module, action = "view") => {
    try {
        // Guard: if protect middleware didn't run or req.user wasn't set,
        // fail closed rather than crashing with a confusing TypeError.
        if (!currentUser) {
            console.error(`[buildScopeFilter] currentUser is undefined for module "${module}" (action "${action}") — req.user was not set by protect middleware`);
            return false;
        }

        // role is a populated Mongoose document — call toObject() so optional
        // chaining on nested subdocuments works reliably as plain JS objects.
        const role = currentUser.role?.toObject
            ? currentUser.role.toObject()
            : currentUser.role;

        const permission = role?.modulePermissions?.[module]?.[action];

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
        console.error(`[buildScopeFilter] error resolving scope for module "${module}" (action "${action}"):`, err);
        throw err;
    }
};