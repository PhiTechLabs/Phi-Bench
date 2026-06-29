/**
 * ────────────────────────────────────────────────────────────
 *  CODE PREVIEW API LAYER
 * ────────────────────────────────────────────────────────────
 *  Read-only "what code will this record get" preview, shown on
 *  the Job/Candidate/Client create forms before saving. Backed by
 *  GET /api/code-preview/:entityType.
 *
 *  This never reserves or assigns anything — it's just a preview.
 *  The real code is assigned by the backend at the moment the
 *  record is actually created.
 * ────────────────────────────────────────────────────────────
 */

import axiosInstance from "./axiosInstance";

// entityType: "job" | "candidate" | "client"
export const getNextCodePreview = async (entityType) => {
    const { data } = await axiosInstance.get(`/code-preview/${entityType}`);
    return data.code;
};