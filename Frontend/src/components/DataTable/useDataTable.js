import { useState, useEffect, useMemo, useCallback } from "react";

// ─── VIEWS STORAGE ────────────────────────────────────────────────────────────
const VIEWS_KEY      = (s) => `${s}_views_v3`;
const ACTIVE_KEY     = (s) => `${s}_active_view_v3`;

const loadViews = (storageKey) => {
    try {
        const s = JSON.parse(localStorage.getItem(VIEWS_KEY(storageKey)));
        if (Array.isArray(s) && s.length) return s;
    } catch {}
    return [{ id: "__all__", label: "All Records", builtIn: true, filters: {}, search: "", sort: { key: null, dir: null } }];
};
const saveViews = (storageKey, views) =>
    localStorage.setItem(VIEWS_KEY(storageKey), JSON.stringify(views));

// Serialise filter state (Set → Array) for storage/comparison
const serialiseFilters = (filters) =>
    Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, v instanceof Set ? Array.from(v).sort() : v]));

const filtersEqual = (a, b) => JSON.stringify(serialiseFilters(a)) === JSON.stringify(serialiseFilters(b));

export const useDataTable = ({ registry, defaultVisibleKeys, storageKey, data }) => {

    /* ──────────── COLUMN WIDTHS ──────────── */
    const [columnWidths, setColumnWidths] = useState(() => {
        try { return JSON.parse(localStorage.getItem(`${storageKey}_widths`)) || {}; } catch { return {}; }
    });
    useEffect(() => { localStorage.setItem(`${storageKey}_widths`, JSON.stringify(columnWidths)); }, [columnWidths, storageKey]);
    const resizeColumn = useCallback((key, w) => setColumnWidths((p) => ({ ...p, [key]: Math.max(80, w) })), []);

    /* ──────────── VISIBLE COLUMNS ──────────── */
    const [visibleKeys, setVisibleKeys] = useState(defaultVisibleKeys);
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(`${storageKey}_cols`));
            if (Array.isArray(saved) && saved.length) {
                let next = saved.filter((k) => registry.find((c) => c.key === k));
                registry.forEach((c) => { if (c.removable === false && !next.includes(c.key)) next.unshift(c.key); });
                const fixed = registry.filter((c) => c.fixed && next.includes(c.key)).map((c) => c.key);
                setVisibleKeys([...fixed, ...next.filter((k) => !fixed.includes(k))]);
            }
        } catch {}
    // eslint-disable-next-line
    }, []);
    useEffect(() => { localStorage.setItem(`${storageKey}_cols`, JSON.stringify(visibleKeys)); }, [visibleKeys, storageKey]);

    const columns = visibleKeys.map((k) => {
        const col = registry.find((c) => c.key === k);
        return col ? { ...col, width: columnWidths[k] || col.width || 160 } : null;
    }).filter(Boolean);

    const availableToAdd = registry.filter((c) => !visibleKeys.includes(c.key));
    const addColumn      = (key) => { if (!visibleKeys.includes(key)) setVisibleKeys([...visibleKeys, key]); };
    const removeColumn   = (key) => {
        const col = registry.find((c) => c.key === key);
        if (!col || col.fixed || col.removable === false) return;
        setVisibleKeys(visibleKeys.filter((k) => k !== key));
    };
    const resetColumns = () => setVisibleKeys(defaultVisibleKeys);

    /* ──────────── DRAG & DROP ──────────── */
    const [dragKey, setDragKey]   = useState(null);
    const [overKey, setOverKey]   = useState(null);
    const [dropSide, setDropSide] = useState(null);

    const onHeaderDragStart = (e, col) => {
        if (col.fixed) return e.preventDefault();
        setDragKey(col.key);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", col.key);
    };
    const onHeaderDragOver = (e, col) => {
        if (col.fixed || !dragKey || dragKey === col.key) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        setOverKey(col.key);
        setDropSide(e.clientX < rect.left + rect.width / 2 ? "left" : "right");
    };
    const onHeaderDrop = (e, col) => {
        e.preventDefault();
        if (col.fixed || !dragKey || dragKey === col.key) return resetDrag();
        const fromIdx = visibleKeys.indexOf(dragKey);
        let toIdx     = visibleKeys.indexOf(col.key);
        if (fromIdx === -1 || toIdx === -1) return resetDrag();
        const next = [...visibleKeys];
        const [moved] = next.splice(fromIdx, 1);
        if (fromIdx < toIdx) toIdx--;
        if (dropSide === "right") toIdx++;
        next.splice(toIdx, 0, moved);
        const fixed = registry.filter((c) => c.fixed && next.includes(c.key)).map((c) => c.key);
        setVisibleKeys([...fixed, ...next.filter((k) => !fixed.includes(k))]);
        resetDrag();
    };
    const resetDrag = () => { setDragKey(null); setOverKey(null); setDropSide(null); };

    /* ──────────── SEARCH ──────────── */
    const [search, setSearch] = useState("");

    /* ──────────── SORT ──────────── */
    const [sort, setSort] = useState(() => {
        try { return JSON.parse(localStorage.getItem(`${storageKey}_sort`)) || { key: null, dir: null }; } catch { return { key: null, dir: null }; }
    });
    useEffect(() => { localStorage.setItem(`${storageKey}_sort`, JSON.stringify(sort)); }, [sort, storageKey]);
    const toggleSort = (key) => setSort((s) => {
        if (s.key !== key) return { key, dir: "asc" };
        if (s.dir === "asc") return { key, dir: "desc" };
        return { key: null, dir: null };
    });

    /* ──────────── FILTERS ──────────── */
    // { columnKey: Set([value, ...]) }
    const [filters, setFilters] = useState({});
    // Date range filters: { columnKey: { from: "YYYY-MM-DD", to: "YYYY-MM-DD" } }
    const [dateFilters, setDateFiltersState] = useState({});

    const setColumnFilter = (key, values) => {
        setFilters((prev) => {
            const next = { ...prev };
            if (!values || values.length === 0) delete next[key];
            else next[key] = new Set(values);
            return next;
        });
    };

    const setDateFilter = (key, from, to) => {
        setDateFiltersState((prev) => {
            const next = { ...prev };
            if (!from && !to) delete next[key];
            else next[key] = { from: from || "", to: to || "" };
            return next;
        });
    };

    const clearDateFilter = (key) => {
        setDateFiltersState((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const clearAllFilters   = () => { setFilters({}); setDateFiltersState({}); setSearch(""); };
    const hasActiveFilters  = Object.keys(filters).length > 0 || Object.keys(dateFilters).length > 0 || search.trim().length > 0;
    const activeFilterCount = Object.keys(filters).length + Object.keys(dateFilters).length + (search.trim() ? 1 : 0);

    const columnDistinctValues = useMemo(() => {
        const ALWAYS_SKIP = new Set(["sno", "toggle"]);
        const map = {};
        registry.forEach((col) => {
            if (ALWAYS_SKIP.has(col.type)) return;
            const set = new Set();
            data.forEach((row) => {
                const v = row[col.key];
                if (v == null || v === "") return;
                if (col.type === "chips") {
                    // Split comma-separated into individual values
                    String(v).split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => set.add(s));
                } else if (col.type === "location") {
                    // Use the city sub-field
                    const city = row[col.cityKey || "city"];
                    if (city) set.add(String(city));
                } else {
                    set.add(String(v));
                }
            });
            map[col.key] = Array.from(set).sort();
        });
        return map;
    }, [registry, data]);

    /* ──────────── PAGINATION ──────────── */
    const [page, setPage]         = useState(1);
    const [pageSize, setPageSize] = useState(() => {
        const s = parseInt(localStorage.getItem(`${storageKey}_pageSize`), 10);
        return Number.isNaN(s) ? 50 : s;
    });
    useEffect(() => { localStorage.setItem(`${storageKey}_pageSize`, String(pageSize)); }, [pageSize, storageKey]);

    /* ──────────── PROCESS DATA ──────────── */
    const processedData = useMemo(() => {
        let rows = [...data];
        // Checkbox filters (text, status, chips etc.)
        Object.entries(filters).forEach(([key, vals]) => {
            const col = registry.find((c) => c.key === key);
            if (col?.type === "chips") {
                // chips: row matches if any of its comma-split values is in the selected set
                rows = rows.filter((r) => {
                    const raw = String(r[key] || "");
                    const chips = raw.split(",").map((s) => s.trim()).filter(Boolean);
                    return chips.some((chip) => vals.has(chip));
                });
            } else {
                rows = rows.filter((r) => vals.has(String(r[key])));
            }
        });
        // Date range filters
        Object.entries(dateFilters).forEach(([key, { from, to }]) => {
            rows = rows.filter((r) => {
                const raw = r[key];
                if (!raw) return false;
                const d = new Date(raw);
                if (isNaN(d)) return false;
                if (from && d < new Date(from)) return false;
                if (to) {
                    const toEnd = new Date(to);
                    toEnd.setHours(23, 59, 59, 999);
                    if (d > toEnd) return false;
                }
                return true;
            });
        });
        if (search.trim()) {
            const q = search.toLowerCase();
            const sKeys = registry.filter((c) => c.searchable !== false).map((c) => c.key);
            rows = rows.filter((r) => sKeys.some((k) => String(r[k] || "").toLowerCase().includes(q)));
        }
        if (sort.key && sort.dir) {
            const col = registry.find((c) => c.key === sort.key);
            const st  = col?.sortType || "string";
            rows.sort((a, b) => {
                const av = a[sort.key], bv = b[sort.key];
                if (av == null && bv == null) return 0;
                if (av == null) return 1;
                if (bv == null) return -1;
                let cmp = st === "number" ? Number(av) - Number(bv)
                        : st === "date"   ? new Date(av) - new Date(bv)
                        : String(av).localeCompare(String(bv));
                return sort.dir === "asc" ? cmp : -cmp;
            });
        }
        return rows;
    }, [data, filters, search, sort, registry]);

    useEffect(() => { setPage(1); }, [search, filters, sort]);

    const totalRows  = processedData.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    const safePage   = Math.min(page, totalPages);
    const pagedData  = useMemo(() =>
        processedData.slice((safePage - 1) * pageSize, safePage * pageSize),
        [processedData, safePage, pageSize]
    );

    /* ──────────── ROW SELECTION ──────────── */
    const [selectedIds, setSelectedIds] = useState(new Set());
    const toggleRow = useCallback((id) => setSelectedIds((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    }), []);
    const togglePageAll = useCallback(() => setSelectedIds((prev) => {
        const pids = pagedData.map((r) => r.id);
        const allSel = pids.every((id) => prev.has(id));
        const next = new Set(prev);
        allSel ? pids.forEach((id) => next.delete(id)) : pids.forEach((id) => next.add(id));
        return next;
    }), [pagedData]);
    const clearSelection     = () => setSelectedIds(new Set());
    const allOnPageSelected  = pagedData.length > 0 && pagedData.every((r) => selectedIds.has(r.id));
    const someOnPageSelected = pagedData.some((r) => selectedIds.has(r.id));
    useEffect(() => {
        const valid = new Set(data.map((r) => r.id));
        setSelectedIds((prev) => {
            const next = new Set([...prev].filter((id) => valid.has(id)));
            return next.size === prev.size ? prev : next;
        });
    }, [data]);

    /* ══════════════════════════════════════════════════════
     *  VIEWS SYSTEM
     * ══════════════════════════════════════════════════════
     *
     * A view stores: id, label, builtIn, filters (plain arrays), search, sort
     * Applying a view restores all filter/search/sort state.
     * "Dirty" = current state differs from the active view's saved state.
     */
    const [views,        setViewsState]  = useState(() => loadViews(storageKey));
    const [activeViewId, setActiveViewId] = useState(() => localStorage.getItem(ACTIVE_KEY(storageKey)) || "__all__");

    useEffect(() => { saveViews(storageKey, views); },           [views, storageKey]);
    useEffect(() => { localStorage.setItem(ACTIVE_KEY(storageKey), activeViewId); }, [activeViewId, storageKey]);

    // ── RESTORE VIEW STATE ON MOUNT ───────────────────────────────────────────
    // When the user navigates away and comes back, localStorage restores the
    // activeViewId correctly (so the tab underline is right) but filters/search
    // start empty. This effect applies the saved view's state on first render
    // so the data shown matches the highlighted tab — not just on re-click.
    useEffect(() => {
        if (activeViewId === "__all__") return; // All Records — empty state is correct
        const savedViews = loadViews(storageKey);
        const view = savedViews.find((v) => v.id === activeViewId);
        if (!view) return;
        // Restore filters
        const restoredFilters = {};
        Object.entries(view.filters || {}).forEach(([k, v]) => {
            const arr = Array.isArray(v) ? v : [];
            if (arr.length) restoredFilters[k] = new Set(arr);
        });
        setFilters(restoredFilters);
        setDateFiltersState(view.dateFilters || {});
        setSearch(view.search || "");
        setSort(view.sort || { key: null, dir: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally runs once on mount only

    const activeView = views.find((v) => v.id === activeViewId) || views[0];

    // Serialise current live state for dirty check
    const liveState = useMemo(() => ({
        filters:     serialiseFilters(filters),
        dateFilters: JSON.stringify(dateFilters),
        search:      search.trim(),
        sort,
    }), [filters, dateFilters, search, sort]);

    const savedState = useMemo(() => {
        if (!activeView) return null;
        return {
            filters: Object.fromEntries(
                Object.entries(activeView.filters || {}).map(([k, v]) => [k, Array.isArray(v) ? [...v].sort() : v])
            ),
            dateFilters: JSON.stringify(activeView.dateFilters || {}),
            search: (activeView.search || "").trim(),
            sort:   activeView.sort || { key: null, dir: null },
        };
    }, [activeView]);

    const viewIsDirty = savedState ? JSON.stringify(liveState) !== JSON.stringify(savedState) : false;

    // Apply a view — restore its state
    const applyView = useCallback((view) => {
        setActiveViewId(view.id);
        const restoredFilters = {};
        Object.entries(view.filters || {}).forEach(([k, v]) => {
            const arr = Array.isArray(v) ? v : [];
            if (arr.length) restoredFilters[k] = new Set(arr);
        });
        setFilters(restoredFilters);
        setDateFiltersState(view.dateFilters || {});
        setSearch(view.search || "");
        setSort(view.sort || { key: null, dir: null });
        setPage(1);
    }, []);

    // Capture current state as a view payload
    const captureCurrentState = useCallback(() => ({
        filters:     serialiseFilters(filters),
        dateFilters: dateFilters,
        search:      search.trim(),
        sort,
    }), [filters, dateFilters, search, sort]);

    // Save current state as a new view
    const saveAsNewView = useCallback((label) => {
        if (!label.trim()) return null;
        const id = `view_${Date.now()}`;
        const newView = { id, label: label.trim(), builtIn: false, ...captureCurrentState() };
        setViewsState((prev) => [...prev, newView]);
        setActiveViewId(id);
        return id;
    }, [captureCurrentState]);

    // Overwrite the active custom view with current state
    const updateActiveView = useCallback(() => {
        if (!activeView || activeView.builtIn) return;
        setViewsState((prev) => prev.map((v) =>
            v.id === activeView.id ? { ...v, ...captureCurrentState() } : v
        ));
    }, [activeView, captureCurrentState]);

    // Rename
    const renameView = useCallback((id, label) => {
        if (!label.trim()) return;
        setViewsState((prev) => prev.map((v) => v.id === id ? { ...v, label: label.trim() } : v));
    }, []);

    // Delete
    const deleteView = useCallback((id) => {
        setViewsState((prev) => prev.filter((v) => v.id !== id));
        if (activeViewId === id) {
            const fallback = views.find((v) => v.id === "__all__") || views[0];
            if (fallback) applyView(fallback);
        }
    }, [activeViewId, views, applyView]);

    // Duplicate
    const duplicateView = useCallback((id) => {
        const src = views.find((v) => v.id === id);
        if (!src) return;
        const newId   = `view_${Date.now()}`;
        const copy    = { ...src, id: newId, label: `${src.label} (copy)`, builtIn: false };
        setViewsState((prev) => {
            const idx  = prev.findIndex((v) => v.id === id);
            const next = [...prev];
            next.splice(idx + 1, 0, copy);
            return next;
        });
        applyView(copy);
    }, [views, applyView]);

    return {
        // columns
        columnWidths, resizeColumn,
        columns, availableToAdd, addColumn, removeColumn, resetColumns,
        visibleKeys, setVisibleKeys,
        // drag
        dragKey, overKey, dropSide, onHeaderDragStart, onHeaderDragOver, onHeaderDrop, resetDrag,
        // search
        search, setSearch,
        // sort
        sort, toggleSort,
        // filters
        filters, setColumnFilter, clearAllFilters, hasActiveFilters, activeFilterCount, columnDistinctValues,
        dateFilters, setDateFilter, clearDateFilter,
        // pagination
        page: safePage, setPage, pageSize, setPageSize, totalRows, totalPages, pagedData,
        // selection
        selectedIds, toggleRow, togglePageAll, clearSelection, allOnPageSelected, someOnPageSelected,
        // views
        views, activeViewId, activeView, viewIsDirty,
        applyView, saveAsNewView, updateActiveView, renameView, deleteView, duplicateView,
        captureCurrentState,
    };
};