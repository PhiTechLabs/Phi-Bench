import express from "express";

import {
    getTeams,
    createTeam,
    updateTeam,
    deleteTeam,
} from "../controllers/teamController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Team membership directly controls who a "team"-scoped role can see
// (see utils/permissionScope.js) — these routes must never be reachable
// without being logged in AND holding explicit "teams" permission. Today
// only super_admin can pass requirePermission("teams", ...), since no
// other seeded role has a "teams" entry in modulePermissions yet — that's
// the correct, safe default until a real UI exists for granting it.

router.get(
    "/",
    protect,
    requirePermission("teams", "view"),
    getTeams
);

router.post(
    "/",
    protect,
    requirePermission("teams", "add"),
    createTeam
);

router.put(
    "/:id",
    protect,
    requirePermission("teams", "edit"),
    updateTeam
);

router.delete(
    "/:id",
    protect,
    requirePermission("teams", "delete"),
    deleteTeam
);

export default router;