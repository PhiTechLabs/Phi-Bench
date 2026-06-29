import express from "express";

import { globalSearch } from "../controllers/searchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// No requirePermission gate here on purpose — search itself is available to
// any authenticated user (consistent with the nav items they can already
// see), and the underlying service is what actually applies candidate
// permission scoping. Job/client results are unscoped, matching how those
// two modules already behave everywhere else in the app today.
router.get("/", protect, globalSearch);

export default router;