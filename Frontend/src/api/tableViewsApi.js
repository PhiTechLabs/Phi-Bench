import axiosInstance from "./axiosInstance";

// ─── SERVER-SIDE DATATABLE VIEWS ──────────────────────────────────────────────
// Thin wrapper the useDataTable hook calls to keep saved views (filters,
// search, sort, column order, column widths) in sync with the backend, so
// the same account sees the same views/columns on any device or browser —
// localStorage alone only ever lived on one machine.
//
// Both calls are best-effort from the hook's point of view: network errors
// are swallowed by the caller so a slow/offline backend never blocks the
// table from working off the local cache.

export const fetchTableViews = async (tableKey) => {
    const res = await axiosInstance.get(`/table-views/${encodeURIComponent(tableKey)}`);
    return res.data; // { views, activeViewId }
};

export const saveTableViews = async (tableKey, { views, activeViewId }) => {
    const res = await axiosInstance.put(`/table-views/${encodeURIComponent(tableKey)}`, {
        views,
        activeViewId,
    });
    return res.data;
};