import { useState, useEffect, useMemo, useCallback } from "react";

/**
 * ────────────────────────────────────────────────────────────
 *  useDataTable — single source of truth for table state
 * ────────────────────────────────────────────────────────────
 *  Manages: visible columns, drag&drop, sort, filter, pagination,
 *  search, multi-row selection. Pure logic — no UI.
 *
 *  Persisted to localStorage:
 *    - column order/visibility
 *    - sort state
 *    - page size
 *  Per-table key prefix (`storageKey` prop) keeps tables isolated.
 * ────────────────────────────────────────────────────────────
 */

export const useDataTable = ({ registry, defaultVisibleKeys, storageKey, data }) => {
  /* ──────────────── COLUMNS ──────────────── */
  const [visibleKeys, setVisibleKeys] = useState(defaultVisibleKeys);

  const [columnWidths, setColumnWidths] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem(`${storageKey}_widths`)) || {};
  } catch {
    return {};
  }
});

useEffect(() => {
  localStorage.setItem(
    `${storageKey}_widths`,
    JSON.stringify(columnWidths)
  );
}, [columnWidths, storageKey]);

const resizeColumn = useCallback((key, width) => {
  setColumnWidths((prev) => ({
    ...prev,
    [key]: Math.max(80, width), // minimum width
  }));
}, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`${storageKey}_cols`));
      if (Array.isArray(saved) && saved.length) {
        let next = saved.filter((k) => registry.find((c) => c.key === k));
        // Force non-removable columns to exist
        registry.forEach((c) => {
          if (c.removable === false && !next.includes(c.key)) next.unshift(c.key);
        });
        // Force fixed columns to the front in registry order
        const fixed = registry.filter((c) => c.fixed && next.includes(c.key)).map((c) => c.key);
        const rest  = next.filter((k) => !fixed.includes(k));
        setVisibleKeys([...fixed, ...rest]);
      }
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(`${storageKey}_cols`, JSON.stringify(visibleKeys));
  }, [visibleKeys, storageKey]);

  const columns = visibleKeys
  .map((k) => {
    const col = registry.find((c) => c.key === k);
    if (!col) return null;

    return {
      ...col,
      width: columnWidths[k] || col.width || 160,
    };
  })
  .filter(Boolean);
  const availableToAdd  = registry.filter((c) => !visibleKeys.includes(c.key));

  const addColumn = (key) => {
    if (visibleKeys.includes(key)) return;
    setVisibleKeys([...visibleKeys, key]);
  };
  const removeColumn = (key) => {
    const col = registry.find((c) => c.key === key);
    if (!col || col.fixed || col.removable === false) return;
    setVisibleKeys(visibleKeys.filter((k) => k !== key));
  };
  const resetColumns = () => setVisibleKeys(defaultVisibleKeys);

  /* ──────────────── DRAG & DROP ──────────────── */
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
    if (fromIdx < toIdx) toIdx -= 1;
    if (dropSide === "right") toIdx += 1;
    next.splice(toIdx, 0, moved);
    const fixed = registry.filter((c) => c.fixed && next.includes(c.key)).map((c) => c.key);
    const rest  = next.filter((k) => !fixed.includes(k));
    setVisibleKeys([...fixed, ...rest]);
    resetDrag();
  };
  const resetDrag = () => { setDragKey(null); setOverKey(null); setDropSide(null); };

  /* ──────────────── SEARCH ──────────────── */
  const [search, setSearch] = useState("");

  /* ──────────────── SORT ──────────────── */
  const [sort, setSort] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`${storageKey}_sort`)) || { key: null, dir: null };
    } catch {
      return { key: null, dir: null };
    }
  });
  useEffect(() => {
    localStorage.setItem(`${storageKey}_sort`, JSON.stringify(sort));
  }, [sort, storageKey]);

  const toggleSort = (key) => {
    setSort((s) => {
      if (s.key !== key) return { key, dir: "asc" };
      if (s.dir === "asc") return { key, dir: "desc" };
      return { key: null, dir: null }; // 3rd click clears sort
    });
  };

  /* ──────────────── FILTERS ──────────────── */
  // { columnKey: Set([selected values]) }
  const [filters, setFilters] = useState({});

  const setColumnFilter = (key, values) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (!values || values.length === 0) delete next[key];
      else next[key] = new Set(values);
      return next;
    });
  };
  const clearAllFilters = () => setFilters({});
  const hasActiveFilters = Object.keys(filters).length > 0;

  /* Compute distinct values per column for filter dropdowns */
  const columnDistinctValues = useMemo(() => {
    const map = {};
    columns.forEach((col) => {
      if (!col.filterable) return;
      const set = new Set();
      data.forEach((row) => {
        const v = row[col.key];
        if (v !== undefined && v !== null && v !== "") {
          set.add(typeof v === "string" ? v : String(v));
        }
      });
      map[col.key] = Array.from(set).sort();
    });
    return map;
  }, [columns, data]);

  /* ──────────────── PAGINATION ──────────────── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const saved = parseInt(localStorage.getItem(`${storageKey}_pageSize`), 10);
    return Number.isNaN(saved) ? 50 : saved;
  });
  useEffect(() => {
    localStorage.setItem(`${storageKey}_pageSize`, String(pageSize));
  }, [pageSize, storageKey]);

  /* ──────────────── PROCESS DATA ──────────────── */
  // 1. Filter (column filters)
  // 2. Search
  // 3. Sort
  // 4. Paginate
  const processedData = useMemo(() => {
    let rows = [...data];

    // Column filters
    Object.entries(filters).forEach(([key, values]) => {
      rows = rows.filter((r) => values.has(String(r[key])));
    });

    // Global search across registered searchable keys
    if (search.trim()) {
      const q = search.toLowerCase();
      const searchableKeys = registry.filter((c) => c.searchable !== false).map((c) => c.key);
      rows = rows.filter((r) =>
        searchableKeys.some((k) => String(r[k] || "").toLowerCase().includes(q))
      );
    }

    // Sort
    if (sort.key && sort.dir) {
      const col = registry.find((c) => c.key === sort.key);
      const sortType = col?.sortType || "string";
      rows.sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        let cmp = 0;
        if (sortType === "number") cmp = Number(av) - Number(bv);
        else if (sortType === "date") cmp = new Date(av).getTime() - new Date(bv).getTime();
        else cmp = String(av).localeCompare(String(bv));
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, filters, search, sort, registry]);

  /* Reset to first page when filters/search/sort change */
  useEffect(() => { setPage(1); }, [search, filters, sort]);

  const totalRows  = processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage   = Math.min(page, totalPages);
  const pagedData  = useMemo(
    () => processedData.slice((safePage - 1) * pageSize, safePage * pageSize),
    [processedData, safePage, pageSize]
  );

  /* ──────────────── ROW SELECTION ──────────────── */
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleRow = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const togglePageAll = useCallback(() => {
    setSelectedIds((prev) => {
      const pageIds = pagedData.map((r) => r.id);
      const allSelected = pageIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }, [pagedData]);

  const clearSelection = () => setSelectedIds(new Set());

  const allOnPageSelected = pagedData.length > 0 && pagedData.every((r) => selectedIds.has(r.id));
  const someOnPageSelected = pagedData.some((r) => selectedIds.has(r.id));

  /* Drop selection if rows disappear */
  useEffect(() => {
    const validIds = new Set(data.map((r) => r.id));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [data]);

  return {
    columnWidths,
resizeColumn,
    // columns
    columns, availableToAdd, addColumn, removeColumn, resetColumns,
    // drag
    dragKey, overKey, dropSide, onHeaderDragStart, onHeaderDragOver, onHeaderDrop, resetDrag,
    // search
    search, setSearch,
    // sort
    sort, toggleSort,
    // filters
    filters, setColumnFilter, clearAllFilters, hasActiveFilters, columnDistinctValues,
    // pagination
    page: safePage, setPage, pageSize, setPageSize, totalRows, totalPages, pagedData,
    // selection
    selectedIds, toggleRow, togglePageAll, clearSelection, allOnPageSelected, someOnPageSelected,
  };
};