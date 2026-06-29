/**
 * ────────────────────────────────────────────────────────────
 *  GLOBAL SEARCH API LAYER
 * ────────────────────────────────────────────────────────────
 *  Powers the navbar's search bar — searches across jobs,
 *  candidates, and clients by reference code (JC001, CD014,
 *  CL003) or by name/title. Backed by GET /api/search?q=...
 *
 *  This is distinct from each DataTable's own local search box,
 *  which only filters rows already loaded for that one page.
 * ────────────────────────────────────────────────────────────
 */

import axiosInstance from "./axiosInstance";

export const globalSearch = async (query) => {
    const { data } = await axiosInstance.get("/search", {
        params: { q: query },
    });
    return data.results || [];
};

// Where the user should land when they pick a given search result.
export const getSearchResultRoute = (result) => {
    switch (result.entityType) {
        case "job":
            return `/jobs/${result.id}`;
        case "candidate":
            return `/candidates/${result.id}`;
        case "client":
            return `/client-list/${result.id}`;
        default:
            return null;
    }
};