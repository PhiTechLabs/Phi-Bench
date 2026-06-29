import asyncHandler from "express-async-handler";
import { globalSearchService } from "../services/searchService.js";

// ─── GLOBAL SEARCH ────────────────────────────────────────────────────────────
// GET /search?q=...  — powers the navbar's search bar.
export const globalSearch = asyncHandler(async (req, res) => {
    const results = await globalSearchService(req.query.q, req.user.id);
    res.json({ results });
});