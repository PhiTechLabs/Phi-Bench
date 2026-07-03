import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDataTable } from "./useDataTable";
import { renderCell } from "./cellRenderers";
import PermissionGuard from "../PermissionGuard";

/* ═══════════════════════════════════════════════════════════════════════════
 *  DataTable — with Saved Views + Advanced Filter Panel (ATS-grade)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Views:  Named snapshots of {filters, search, sort}.
 *          Shown as tabs above the table.  Create / rename / duplicate / delete.
 *          Dirty indicator when current state diverges from saved view.
 *
 *  Filters: Slide-in right panel.  Select any filterable column, pick values
 *           from a searchable checkbox list.  Shows live match count.
 *           Applied filters shown as chips below the views bar.
 */

const DataTable = ({
    columns: registry,
    defaultVisible,
    data,
    storageKey,
    onRowClick,
    onDelete,
    onBulkDelete,
    bulkActions = [],
    searchPlaceholder = "Search…",
    emptyState = { title: "No records yet", hint: "" },
    actions,
    deletePermission,
    bulkDeletePermission,
}) => {
    const defaultVisibleKeys = defaultVisible || registry.filter((c) => c.defaultVisible).map((c) => c.key);
    const t = useDataTable({ registry, defaultVisibleKeys, storageKey, data });

    const [showAddColumn,   setShowAddColumn]   = useState(false);
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    return (
        <div className="w-full">

            {/* ── VIEWS TABS ────────────────────────────────────────────── */}
            <ViewsTabs t={t} />

            {/* ── TOOLBAR ──────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2 px-1 py-2">

                {/* search */}
                <div className="relative flex-1 min-w-0 max-w-xs">
                    <SearchIcon />
                    <input type="text" placeholder={searchPlaceholder}
                        value={t.search} onChange={(e) => t.setSearch(e.target.value)}
                        className="h-8 w-full rounded-lg border border-[#E8E6E0] bg-white pl-8 pr-8 text-[12.5px] placeholder-[#9B9890] outline-none focus:border-[#93AEFF] focus:ring-2 focus:ring-[#E8EEFF] transition"
                    />
                    {t.search && (
                        <button onClick={() => t.setSearch("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9B9890] hover:text-[#1C1B18]">
                            <XIcon size={10} />
                        </button>
                    )}
                </div>

                {/* filter button */}
                <button
                    onClick={() => setShowFilterPanel(true)}
                    className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-medium transition ${
                        t.hasActiveFilters
                            ? "border-[#1C4ED8] bg-[#EEF2FF] text-[#1C4ED8]"
                            : "border-[#E8E6E0] bg-white text-[#4A4845] hover:bg-[#F5F4F0]"
                    }`}>
                    <FilterIcon size={13} />
                    Filters
                    {t.activeFilterCount > 0 && (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#1C4ED8] px-1 text-[9.5px] font-bold text-white">
                            {t.activeFilterCount}
                        </span>
                    )}
                </button>

                {/* active filter chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {Object.entries(t.filters).map(([key, valueSet]) => {
                        const col    = registry.find((c) => c.key === key);
                        const values = Array.from(valueSet);
                        return (
                            <span key={key}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#BFD3FF] bg-[#F0F5FF] px-2.5 py-0.5 text-[11px] font-medium text-[#1C4ED8]">
                                <span className="font-bold">{col?.label || key}:</span>
                                <span>{values.length === 1 ? values[0] : `${values.length} selected`}</span>
                                <button onClick={() => t.setColumnFilter(key, [])}
                                    className="ml-0.5 opacity-60 hover:opacity-100 transition">
                                    <XIcon size={9} />
                                </button>
                            </span>
                        );
                    })}
                    {t.hasActiveFilters && (
                        <button onClick={t.clearAllFilters}
                            className="flex items-center gap-1 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-2.5 py-0.5 text-[11px] font-medium text-[#C2410C] hover:bg-[#FFEDD5] transition">
                            <XIcon size={9} /> Clear all
                        </button>
                    )}
                </div>

                <div className="ml-auto flex items-center gap-2">
                    {actions}
                </div>
            </div>

            {/* ── BULK BAR ─────────────────────────────────────────────── */}
            {t.selectedIds.size > 0 && (
                <div className="mb-2 flex items-center justify-between rounded-[10px] border border-[#BFD3FF] bg-[#F0F5FF] px-4 py-2.5 text-[12.5px]">
                    <div className="flex items-center gap-3">
                        <span className="font-medium text-[#1C4ED8]">{t.selectedIds.size} selected</span>
                        <button onClick={t.clearSelection} className="text-[12px] text-[#1C4ED8] hover:underline">Clear</button>
                    </div>
                    <div className="flex items-center gap-2">
                        {bulkActions.map((action, i) => (
                            <button key={i} onClick={() => action.onClick(Array.from(t.selectedIds))}
                                className="flex items-center gap-1 rounded-lg border border-[#BFD3FF] bg-white px-3 py-1.5 text-[12px] font-medium text-[#1C4ED8] hover:bg-[#F0F5FF] transition">
                                {action.label}
                            </button>
                        ))}
                        {onBulkDelete && (
                            <PermissionGuard module={bulkDeletePermission?.module} action={bulkDeletePermission?.action}>
                                <button onClick={() => { if (window.confirm(`Delete ${t.selectedIds.size} items?`)) { onBulkDelete(Array.from(t.selectedIds)); t.clearSelection(); } }}
                                    className="flex items-center gap-1 rounded-lg border border-[#FECACA] bg-white px-3 py-1.5 text-[12px] font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition">
                                    Delete selected
                                </button>
                            </PermissionGuard>
                        )}
                    </div>
                </div>
            )}

            {/* ── TABLE CARD ───────────────────────────────────────────── */}
            <div className="rounded-xl border border-[#E8E6E0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">

                {/* column controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl border-b border-[#F0EDE8] bg-[#FAFAF8] px-4 py-2">
                    <span className="text-[11px] text-[#9B9890]">
                        {t.totalRows} {t.totalRows === 1 ? "record" : "records"}
                        {t.hasActiveFilters && " (filtered)"}
                    </span>
                    <div className="relative flex gap-2">
                        <button onClick={() => setShowAddColumn((s) => !s)} disabled={t.availableToAdd.length === 0}
                            className="flex items-center gap-1 rounded-md border border-[#BFD3FF] bg-[#F0F5FF] px-2 py-1 text-[10.5px] font-medium text-[#1C4ED8] hover:bg-[#E4ECFF] disabled:opacity-40 transition">
                            <span className="text-[12px] leading-none">+</span> Columns
                            {t.availableToAdd.length > 0 && (
                                <span className="rounded-full bg-[#1C4ED8] px-1.5 text-[9px] font-bold text-white">{t.availableToAdd.length}</span>
                            )}
                        </button>
                        <button onClick={t.resetColumns}
                            className="flex h-7 items-center gap-1 rounded-lg border border-[#E0DDD6] bg-white px-2.5 text-[11.5px] font-medium text-[#4A4845] hover:bg-[#F5F4F0] transition">
                            <ResetIcon /> Reset
                        </button>
                        {showAddColumn && t.availableToAdd.length > 0 && (
                            <AddColumnDropdown
                                options={t.availableToAdd}
                                onPick={(col) => { t.addColumn(col.key); setShowAddColumn(false); }}
                                onClose={() => setShowAddColumn(false)}
                            />
                        )}
                    </div>
                </div>

                {/* table */}
                <div className="overflow-x-auto overflow-y-visible">
                    <table className="w-full table-fixed border-collapse text-[12.5px]"
                        style={{ minWidth: t.columns.reduce((s, c) => s + c.width, 0) + 88 }}>
                        <thead>
                            <tr className="bg-[#FAFAF8]">
                                <th style={{ width: 40, minWidth: 40 }} className="border-b border-[#E8E6E0] bg-[#F5F4F0] px-3 py-2 text-center">
                                    <Checkbox checked={t.allOnPageSelected} indeterminate={!t.allOnPageSelected && t.someOnPageSelected} onChange={t.togglePageAll} />
                                </th>
                                {t.columns.map((col, idx) => (
                                    <ColumnHeader
                                        key={col.key}
                                        col={col}
                                        idx={idx}
                                        isLast={idx === t.columns.length - 1}
                                        t={t}
                                    />
                                ))}
                                {onDelete && <th style={{ width: 44, minWidth: 44 }} className="border-b border-[#E8E6E0] px-2 py-2" />}
                            </tr>
                        </thead>
                        <tbody>
                            {t.pagedData.length === 0 ? (
                                <tr><td colSpan={t.columns.length + 1 + (onDelete ? 1 : 0)} className="px-4 py-16 text-center">
                                    <EmptyStateBlock {...emptyState} />
                                </td></tr>
                            ) : (
                                t.pagedData.map((row, rowIdx) => {
                                    const isSel = t.selectedIds.has(row.id);
                                    return (
                                        <tr key={row.id}
                                            className={`group border-b border-[#F0EDE8] transition-colors ${isSel ? "bg-[#F0F5FF]" : "hover:bg-[#FAFAFD]"} ${onRowClick ? "cursor-pointer" : ""}`}
                                            onClick={() => onRowClick?.(row)}>
                                            <td style={{ width: 40, minWidth: 40 }} className="bg-[#FAFAF8] px-3 py-2 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox checked={isSel} onChange={() => t.toggleRow(row.id)} />
                                            </td>
                                            {t.columns.map((col, colIdx) => (
                                                <td key={col.key} style={{ width: col.width, minWidth: col.width }}
                                                    className={`overflow-visible px-2.5 py-1.5 align-middle text-[12.5px] text-[#1C1B18]
                                                        ${col.type === "sno" ? "bg-[#FAFAF8] text-center font-medium text-[#6B6860]" : ""}
                                                        ${colIdx !== t.columns.length - 1 ? "border-r border-[#F5F4F0]" : ""}`}>
                                                    {renderCell({ column: col, row, rowIndex: rowIdx, pageStart: (t.page - 1) * t.pageSize })}
                                                </td>
                                            ))}
                                            {onDelete && (
                                                <PermissionGuard module={deletePermission?.module} action={deletePermission?.action}>
                                                    <td style={{ width: 44, minWidth: 44 }} className="px-2 py-2 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                                                        <button onClick={(e) => { e.stopPropagation(); onDelete(row); }}
                                                            className="inline-flex h-7 w-7 items-center justify-center rounded text-[#9B9890] opacity-0 hover:bg-[#FEF2F2] hover:text-[#DC2626] group-hover:opacity-100 transition">
                                                            <TrashIcon />
                                                        </button>
                                                    </td>
                                                </PermissionGuard>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {t.totalRows > 0 && (
                    <PaginationFooter page={t.page} totalPages={t.totalPages} totalRows={t.totalRows} pageSize={t.pageSize} onPageChange={t.setPage} onPageSizeChange={t.setPageSize} />
                )}
            </div>

            {/* ── FILTER PANEL (slide-in) ───────────────────────────── */}
            {showFilterPanel && (
                <FilterPanel
                    registry={registry}
                    data={data}
                    filters={t.filters}
                    setColumnFilter={t.setColumnFilter}
                    clearAllFilters={t.clearAllFilters}
                    columnDistinctValues={t.columnDistinctValues}
                    totalRows={t.totalRows}
                    onClose={() => setShowFilterPanel(false)}
                />
            )}
        </div>
    );
};

export default DataTable;

/* ═══════════════════════════════════════════════════════════════════════════
 *  VIEWS TABS
 * ═══════════════════════════════════════════════════════════════════════════ */

const ViewsTabs = ({ t }) => {
    const [saveMode,     setSaveMode]     = useState(null); // null | "new" | "update"
    const [saveLabel,    setSaveLabel]    = useState("");
    const [renameId,     setRenameId]     = useState(null);
    const [renameValue,  setRenameValue]  = useState("");
    const [menuId,       setMenuId]       = useState(null);
    const saveLabelRef = useRef();
    const renameRef    = useRef();
    const menuRef      = useRef();

    useEffect(() => { if (saveMode) setTimeout(() => saveLabelRef.current?.focus(), 40); }, [saveMode]);
    useEffect(() => { if (renameId)  setTimeout(() => renameRef.current?.focus(), 40); }, [renameId]);

    // Close menu on outside click
    useEffect(() => {
        if (!menuId) return;
        const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuId(null); };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, [menuId]);

    const commitSave = () => {
        if (saveMode === "new") {
            if (!saveLabel.trim()) return;
            t.saveAsNewView(saveLabel.trim());
        } else if (saveMode === "update") {
            t.updateActiveView();
        }
        setSaveMode(null);
        setSaveLabel("");
    };

    const commitRename = () => {
        if (renameValue.trim()) t.renameView(renameId, renameValue.trim());
        setRenameId(null);
    };

    return (
        <div className="mb-1">

            {/* views tab strip */}
            <div className="flex items-end gap-0 overflow-x-auto border-b border-[#E8E6E0]"
                style={{ scrollbarWidth: "none" }}>
                {t.views.map((view) => {
                    const isActive = view.id === t.activeViewId;
                    const isDirty  = isActive && t.viewIsDirty;
                    return (
                        <div key={view.id}
                            className={`group relative flex shrink-0 items-center gap-1.5 cursor-pointer select-none border-b-2 px-4 py-2.5 transition-all ${
                                isActive
                                    ? "border-[#1C4ED8] text-[#1C4ED8]"
                                    : "border-transparent text-[#6B6860] hover:text-[#1C1B18] hover:bg-[#FAFAF8]"
                            }`}
                            onClick={() => { if (renameId === view.id) return; t.applyView(view); }}>

                            {renameId === view.id ? (
                                <input ref={renameRef} value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onBlur={commitRename}
                                    onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenameId(null); }}
                                    className="w-28 rounded border border-[#93AEFF] bg-white px-1.5 py-0.5 text-[12.5px] outline-none"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <span className="text-[12.5px] font-medium whitespace-nowrap">{view.label}</span>
                            )}

                            {/* dirty dot */}
                            {isDirty && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B] shrink-0" title="Unsaved changes" />
                            )}

                            {/* 3-dot menu — custom views only */}
                            {!view.builtIn && (
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setMenuId((id) => id === view.id ? null : view.id); }}
                                        className={`flex h-5 w-5 items-center justify-center rounded opacity-0 transition hover:bg-[#E8EEFF] group-hover:opacity-60 hover:!opacity-100 ${isActive ? "!opacity-50" : ""}`}>
                                        <DotsIcon />
                                    </button>
                                    {menuId === view.id && (
                                        <div ref={menuRef}
                                            className="absolute left-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-[#E8E6E0] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.14)]"
                                            onClick={(e) => e.stopPropagation()}>
                                            <ViewMenuItem icon={<PencilIcon />} label="Rename"
                                                onClick={() => { setRenameId(view.id); setRenameValue(view.label); setMenuId(null); }} />
                                            <ViewMenuItem icon={<CopyIcon />} label="Duplicate"
                                                onClick={() => { t.duplicateView(view.id); setMenuId(null); }} />
                                            <div className="border-t border-[#F0EDE8] my-0.5" />
                                            <ViewMenuItem icon={<TrashIcon />} label="Delete view" danger
                                                onClick={() => { t.deleteView(view.id); setMenuId(null); }} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* + New View */}
                <button onClick={() => { setSaveMode("new"); setSaveLabel(""); }}
                    className="flex shrink-0 items-center gap-1 border-b-2 border-transparent px-3 py-2.5 text-[12px] font-medium text-[#9B9890] hover:text-[#1C4ED8] hover:bg-[#F0F5FF] transition rounded-t-lg">
                    <span className="text-[16px] leading-none">+</span> New View
                </button>
            </div>

            {/* save/update bar — shows when dirty OR saving */}
            {(t.viewIsDirty || saveMode) && (
                <div className="flex flex-wrap items-center gap-2 border border-[#E8E6E0] border-t-0 rounded-b-xl bg-[#FAFAF8] px-4 py-2.5">

                    {/* save as new */}
                    {saveMode === "new" ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[11.5px] font-semibold text-[#4A4845]">Name this view:</span>
                            <input ref={saveLabelRef} value={saveLabel}
                                onChange={(e) => setSaveLabel(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") commitSave(); if (e.key === "Escape") { setSaveMode(null); setSaveLabel(""); } }}
                                placeholder="e.g. My Open Jobs"
                                className="h-7 w-48 rounded-lg border border-[#93AEFF] bg-white px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-[#E8EEFF]"
                            />
                            <button onClick={commitSave} disabled={!saveLabel.trim()}
                                className="flex h-7 items-center gap-1.5 rounded-lg bg-[#1C4ED8] px-3 text-[12px] font-semibold text-white hover:bg-[#1741B6] transition disabled:opacity-40">
                                <SaveIcon size={11} /> Save View
                            </button>
                            <button onClick={() => { setSaveMode(null); setSaveLabel(""); }}
                                className="text-[11.5px] text-[#9B9890] hover:text-[#4A4845] transition">
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* dirty state actions */}
                            <span className="text-[11.5px] text-[#9B9890]">
                                Unsaved changes to <strong className="text-[#4A4845]">{t.activeView?.label}</strong>
                            </span>
                            <div className="flex items-center gap-2 ml-1">
                                {/* update current (only non-built-in) */}
                                {t.activeView && !t.activeView.builtIn && (
                                    <button onClick={() => { t.updateActiveView(); setSaveMode(null); }}
                                        className="flex h-7 items-center gap-1.5 rounded-lg border border-[#BFD3FF] bg-[#F0F5FF] px-3 text-[11.5px] font-semibold text-[#1C4ED8] hover:bg-[#E4ECFF] transition">
                                        <SaveIcon size={11} /> Update "{t.activeView.label}"
                                    </button>
                                )}
                                <button onClick={() => setSaveMode("new")}
                                    className="flex h-7 items-center gap-1.5 rounded-lg border border-[#E0DDD6] bg-white px-3 text-[11.5px] font-medium text-[#4A4845] hover:bg-[#F5F4F0] transition">
                                    Save as new view
                                </button>
                                <button onClick={() => { t.clearAllFilters(); setSaveMode(null); }}
                                    className="text-[11.5px] text-[#9B9890] hover:text-[#C2410C] transition">
                                    Discard
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const ViewMenuItem = ({ icon, label, danger, onClick }) => (
    <button onClick={onClick}
        className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-[12px] transition hover:bg-[#F5F4F0] ${danger ? "text-[#DC2626] hover:bg-[#FEF2F2]" : "text-[#1C1B18]"}`}>
        <span className={danger ? "text-[#DC2626]" : "text-[#9B9890]"}>{icon}</span>
        {label}
    </button>
);

/* ═══════════════════════════════════════════════════════════════════════════
 *  FILTER PANEL — slide-in right drawer
 * ═══════════════════════════════════════════════════════════════════════════ */

const FilterPanel = ({ registry, data, filters, setColumnFilter, clearAllFilters, columnDistinctValues, totalRows, onClose }) => {
    const filterableColumns = registry.filter((c) => c.filterable);
    const [activeCol,     setActiveCol]     = useState(filterableColumns[0]?.key || null);
    const [colSearch,     setColSearch]     = useState(""); // search within a column's values
    const [panelSearch,   setPanelSearch]   = useState(""); // search across columns

    const activeColDef     = registry.find((c) => c.key === activeCol);
    const activeDistincts  = (columnDistinctValues[activeCol] || []).filter((v) =>
        !colSearch.trim() || v.toLowerCase().includes(colSearch.toLowerCase())
    );
    const activeSelected   = activeCol && filters[activeCol] ? Array.from(filters[activeCol]) : [];
    const totalActiveCount = Object.keys(filters).length;

    const filteredColumns  = filterableColumns.filter((c) =>
        !panelSearch.trim() || c.label.toLowerCase().includes(panelSearch.toLowerCase())
    );

    const toggleValue = (val) => {
        const cur = filters[activeCol] ? Array.from(filters[activeCol]) : [];
        if (cur.includes(val)) setColumnFilter(activeCol, cur.filter((v) => v !== val));
        else setColumnFilter(activeCol, [...cur, val]);
    };

    const selectAll   = () => setColumnFilter(activeCol, columnDistinctValues[activeCol] || []);
    const clearColumn = () => setColumnFilter(activeCol, []);

    return (
        <>
            {/* backdrop */}
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />

            {/* panel */}
            <div className="fixed right-0 top-0 z-50 flex h-full w-[480px] flex-col bg-white shadow-2xl"
                style={{ animation: "slideInRight .18s cubic-bezier(.22,1,.36,1)" }}>

                {/* header */}
                <div className="flex items-center justify-between border-b border-[#F0EDE8] px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF2FF]">
                            <FilterIcon size={15} className="text-[#1C4ED8]" />
                        </div>
                        <div>
                            <p className="text-[14px] font-bold text-[#1C1B18]">Filters</p>
                            <p className="text-[11px] text-[#9B9890] mt-0.5">
                                {totalRows} matching records
                                {totalActiveCount > 0 && ` · ${totalActiveCount} filter${totalActiveCount > 1 ? "s" : ""} active`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {totalActiveCount > 0 && (
                            <button onClick={() => { clearAllFilters(); }}
                                className="rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-3 py-1.5 text-[11.5px] font-medium text-[#C2410C] hover:bg-[#FFEDD5] transition">
                                Clear all
                            </button>
                        )}
                        <button onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E6E0] text-[#9B9890] hover:bg-[#F5F4F0] hover:text-[#1C1B18] transition">
                            <XIcon size={14} />
                        </button>
                    </div>
                </div>

                {/* two-column layout: left = field list, right = values */}
                <div className="flex flex-1 min-h-0">

                    {/* LEFT — filterable field list */}
                    <div className="flex w-[180px] shrink-0 flex-col border-r border-[#F0EDE8]">
                        <div className="px-3 py-2.5 border-b border-[#F5F4F0]">
                            <input type="text" value={panelSearch} onChange={(e) => setPanelSearch(e.target.value)}
                                placeholder="Find field…"
                                className="h-7 w-full rounded-lg border border-[#E8E6E0] bg-[#FAFAF8] px-2.5 text-[11.5px] placeholder-[#9B9890] outline-none focus:border-[#93AEFF] transition"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto py-1">
                            {filteredColumns.map((col) => {
                                const isActive  = activeCol === col.key;
                                const hasFilter = !!filters[col.key]?.size;
                                return (
                                    <button key={col.key}
                                        onClick={() => { setActiveCol(col.key); setColSearch(""); }}
                                        className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-[12.5px] transition ${
                                            isActive ? "bg-[#EEF2FF] text-[#1C4ED8] font-semibold" : "text-[#1C1B18] hover:bg-[#F5F4F0]"
                                        }`}>
                                        <span className="truncate">{col.label}</span>
                                        {hasFilter && (
                                            <span className="ml-1 flex h-4 min-w-[16px] shrink-0 items-center justify-center rounded-full bg-[#1C4ED8] px-1 text-[9px] font-bold text-white">
                                                {filters[col.key].size}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT — values for selected field */}
                    <div className="flex flex-1 min-w-0 flex-col">
                        {activeColDef ? (
                            <>
                                {/* field header */}
                                <div className="border-b border-[#F0EDE8] px-4 py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-[12.5px] font-bold text-[#1C1B18]">{activeColDef.label}</p>
                                        <p className="text-[10.5px] text-[#9B9890] mt-0.5">
                                            {columnDistinctValues[activeCol]?.length || 0} options
                                            {activeSelected.length > 0 && ` · ${activeSelected.length} selected`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {activeSelected.length > 0 && (
                                            <button onClick={clearColumn} className="text-[11px] font-medium text-[#C2410C] hover:underline transition">
                                                Clear
                                            </button>
                                        )}
                                        <button onClick={selectAll} className="text-[11px] font-medium text-[#1C4ED8] hover:underline transition">
                                            Select all
                                        </button>
                                    </div>
                                </div>

                                {/* value search */}
                                <div className="px-4 py-2.5 border-b border-[#F5F4F0]">
                                    <div className="relative">
                                        <SearchIcon />
                                        <input type="text" value={colSearch} onChange={(e) => setColSearch(e.target.value)}
                                            placeholder={`Search ${activeColDef.label.toLowerCase()}…`}
                                            className="h-7 w-full rounded-lg border border-[#E8E6E0] bg-[#FAFAF8] pl-7 pr-3 text-[12px] placeholder-[#9B9890] outline-none focus:border-[#93AEFF] transition"
                                        />
                                        {colSearch && <button onClick={() => setColSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9B9890]"><XIcon size={9} /></button>}
                                    </div>
                                </div>

                                {/* values list */}
                                <div className="flex-1 overflow-y-auto py-1">
                                    {activeDistincts.length === 0 ? (
                                        <div className="py-8 text-center text-[12px] text-[#9B9890]">
                                            {colSearch ? "No matching values" : "No values available"}
                                        </div>
                                    ) : (
                                        activeDistincts.map((val) => {
                                            const isChecked = activeSelected.includes(val);
                                            const count     = data.filter((r) => String(r[activeCol]) === val).length;
                                            return (
                                                <label key={val}
                                                    className={`flex cursor-pointer items-center gap-3 px-4 py-2 transition hover:bg-[#F5F4F0] ${isChecked ? "bg-[#F0F5FF]" : ""}`}>
                                                    <input type="checkbox" checked={isChecked} onChange={() => toggleValue(val)}
                                                        className="h-3.5 w-3.5 cursor-pointer accent-[#1C4ED8] shrink-0"
                                                    />
                                                    <span className={`flex-1 truncate text-[12.5px] ${isChecked ? "font-semibold text-[#1C4ED8]" : "text-[#1C1B18]"}`}>{val}</span>
                                                    <span className="shrink-0 text-[11px] text-[#9B9890]">{count}</span>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>

                                {/* active selections summary */}
                                {activeSelected.length > 0 && (
                                    <div className="border-t border-[#F0EDE8] bg-[#FAFAF8] px-4 py-3">
                                        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9B9890] mb-2">Selected</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {activeSelected.map((v) => (
                                                <span key={v}
                                                    className="inline-flex items-center gap-1.5 rounded-full border border-[#BFD3FF] bg-[#F0F5FF] px-2.5 py-0.5 text-[11px] font-medium text-[#1C4ED8]">
                                                    {v}
                                                    <button onClick={() => toggleValue(v)} className="opacity-60 hover:opacity-100 transition">
                                                        <XIcon size={8} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-1 items-center justify-center text-[12px] text-[#9B9890]">
                                Select a field to filter
                            </div>
                        )}
                    </div>
                </div>

                {/* footer */}
                <div className="border-t border-[#F0EDE8] px-5 py-4 flex items-center justify-between bg-[#FAFAF8]">
                    <p className="text-[11.5px] text-[#9B9890]">
                        <span className="font-bold text-[#1C1B18]">{totalRows}</span> records match current filters
                    </p>
                    <button onClick={onClose}
                        className="flex h-9 items-center gap-2 rounded-xl bg-[#1C4ED8] px-5 text-[13px] font-semibold text-white hover:bg-[#1741B6] transition shadow-sm">
                        Done
                    </button>
                </div>
            </div>
            <style>{`@keyframes slideInRight{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}`}</style>
        </>
    );
};

/* ──────────────────── INLINE FILTER BTN (column header) ──────────────────── */

const InlineFilterBtn = ({ active, open, onToggle, options, selected, onChange, onClose }) => {
    const ref = useRef();
    useEffect(() => {
        if (!open) return;
        const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, [open, onClose]);
    const toggle = (v) => selected.includes(v) ? onChange(selected.filter((x) => x !== v)) : onChange([...selected, v]);
    return (
        <div className="relative" ref={ref}>
            <button onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded transition-all ${
                    active ? "text-[#1C4ED8] opacity-100" : "text-[#C8C5BD] opacity-0 hover:bg-[#F0F5FF] hover:text-[#1C4ED8] group-hover:opacity-100"
                }`}>
                <FilterIcon size={10} />
            </button>
            {open && (
                <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-[#E8E6E0] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between border-b border-[#F0EDE8] bg-[#FAFAF8] px-2.5 py-1.5">
                        <span className="text-[9.5px] font-semibold uppercase tracking-widest text-[#9B9890]">Filter</span>
                        {selected.length > 0 && <button onClick={() => onChange([])} className="text-[10px] font-medium text-[#1C4ED8] hover:underline">Clear</button>}
                    </div>
                    <div className="max-h-56 overflow-y-auto py-1">
                        {options.map((opt) => (
                            <label key={opt} className="flex cursor-pointer items-center gap-2 px-2.5 py-1 text-[11px] text-[#1C1B18] hover:bg-[#FAFAF8] transition">
                                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="h-3 w-3 cursor-pointer accent-[#1C4ED8]" />
                                <span className="truncate">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ──────────────────── OTHER SUB-COMPONENTS ──────────────────── */

const AddColumnDropdown = ({ options, onPick, onClose }) => {
    const ref = useRef();
    useEffect(() => {
        const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, [onClose]);
    return (
        <div ref={ref} className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border border-[#E8E6E0] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <div className="border-b border-[#F0EDE8] bg-[#FAFAF8] px-3 py-1.5 text-[9.5px] font-semibold uppercase tracking-widest text-[#9B9890]">
                Add Column ({options.length})
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
                {options.map((col) => (
                    <button key={col.key} onClick={() => onPick(col)}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11.5px] text-[#1C1B18] hover:bg-[#F0F5FF] hover:text-[#1C4ED8] transition">
                        <span className="text-[12px] text-[#9B9890]">+</span> {col.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const PaginationFooter = ({ page, totalPages, totalRows, pageSize, onPageChange, onPageSizeChange }) => {
    const start = (page - 1) * pageSize + 1;
    const end   = Math.min(page * pageSize, totalRows);
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-xl border-t border-[#F0EDE8] bg-[#FAFAF8] px-4 py-2 text-[11px] text-[#6B6860]">
            <div className="flex items-center gap-3">
                <span>Showing {start}–{end} of {totalRows}</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10.5px] text-[#9B9890]">Rows:</span>
                    <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="cursor-pointer rounded border border-[#E0DDD6] bg-white px-1.5 py-0.5 text-[11px] outline-none focus:border-[#93AEFF]">
                        {[25,50,100,200].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <PageBtn onClick={() => onPageChange(1)} disabled={page === 1}>«</PageBtn>
                <PageBtn onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</PageBtn>
                <span className="px-2 font-medium text-[#1C1B18]">{page} / {totalPages}</span>
                <PageBtn onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>›</PageBtn>
                <PageBtn onClick={() => onPageChange(totalPages)} disabled={page === totalPages}>»</PageBtn>
            </div>
        </div>
    );
};
const PageBtn = ({ onClick, disabled, children }) => (
    <button onClick={onClick} disabled={disabled}
        className="flex h-6 w-6 items-center justify-center rounded border border-[#E0DDD6] bg-white text-[11px] font-medium text-[#4A4845] hover:bg-[#F5F4F0] disabled:cursor-not-allowed disabled:opacity-40 transition">
        {children}
    </button>
);

const Checkbox = ({ checked, indeterminate, onChange }) => {
    const ref = useRef();
    useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
    return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} onClick={(e) => e.stopPropagation()} className="h-3.5 w-3.5 cursor-pointer accent-[#1C4ED8]" />;
};

// ─── COLUMN HEADER ────────────────────────────────────────────────────────────
// Extracted from the thead .map() so that filterOpen state lives in a proper
// component scope — not inside a .map() callback, which would violate React's
// Rules of Hooks (hook count changes whenever column count changes).
const ColumnHeader = ({ col, isLast, t }) => {
    const [filterOpen, setFilterOpen] = useState(false);
    const isDragging   = t.dragKey === col.key;
    const isOver       = t.overKey === col.key && t.dragKey && t.dragKey !== col.key;
    const sortActive   = t.sort.key === col.key;
    const distincts    = t.columnDistinctValues[col.key] || [];
    const filterActive = !!t.filters[col.key]?.size;

    return (
        <th
            draggable={!col.fixed}
            onDragStart={(e) => t.onHeaderDragStart(e, col)}
            onDragOver={(e) => t.onHeaderDragOver(e, col)}
            onDrop={(e) => t.onHeaderDrop(e, col)}
            onDragEnd={t.resetDrag}
            style={{ width: col.width, minWidth: col.width }}
            className={`group relative select-none border-b border-[#E8E6E0] px-3 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#6B6860] transition-colors
                ${col.fixed ? "cursor-default bg-[#F5F4F0]" : "cursor-grab hover:bg-[#F5F4F0] active:cursor-grabbing"}
                ${isDragging ? "opacity-40" : ""}
                ${!isLast ? "border-r border-[#F0EDE8]" : ""}`}>

            {isOver && t.dropSide === "left"  && <span className="pointer-events-none absolute left-0 top-0 h-full w-0.5 bg-[#1C4ED8]" />}
            {isOver && t.dropSide === "right" && <span className="pointer-events-none absolute right-0 top-0 h-full w-0.5 bg-[#1C4ED8]" />}

            {/* resize handle */}
            <div onMouseDown={(e) => {
                e.preventDefault(); e.stopPropagation();
                const sx = e.clientX, sw = col.width;
                const onMove = (mv) => t.resizeColumn(col.key, sw + (mv.clientX - sx));
                const onUp   = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
                document.addEventListener("mousemove", onMove);
                document.addEventListener("mouseup", onUp);
            }} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#1C4ED8]/20 active:bg-[#1C4ED8]" />

            <div className="flex items-center justify-between gap-1">
                <span className={`flex flex-1 items-center gap-1 truncate ${col.sortable ? "cursor-pointer" : ""}`}
                    onClick={(e) => { if (!col.sortable) return; e.stopPropagation(); t.toggleSort(col.key); }}>
                    {col.fixed ? <LockIcon /> : <DragHandle />}
                    <span className="min-w-0 truncate">{col.label}</span>
                    {col.sortable && <SortIcon dir={sortActive ? t.sort.dir : null} />}
                </span>
                <div className="flex items-center gap-0.5">
                    {col.filterable && distincts.length > 0 && (
                        <InlineFilterBtn
                            active={filterActive}
                            open={filterOpen}
                            onToggle={() => setFilterOpen((s) => !s)}
                            options={distincts}
                            selected={filterActive ? Array.from(t.filters[col.key]) : []}
                            onChange={(vals) => t.setColumnFilter(col.key, vals)}
                            onClose={() => setFilterOpen(false)}
                        />
                    )}
                    {col.removable !== false && !col.fixed && (
                        <button onClick={(e) => { e.stopPropagation(); t.removeColumn(col.key); }}
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[#C8C5BD] opacity-0 hover:bg-[#FEF2F2] hover:text-[#DC2626] group-hover:opacity-100 transition">
                            <XIcon />
                        </button>
                    )}
                </div>
            </div>
        </th>
    );
};

const EmptyStateBlock = ({ title, hint, action }) => (
    <div className="flex flex-col items-center gap-2.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F4F0] text-[#9B9890]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/>
            </svg>
        </div>
        <div>
            <div className="text-[14px] font-semibold text-[#1C1B18]">{title}</div>
            {hint && <div className="mt-0.5 text-[11.5px] text-[#9B9890]">{hint}</div>}
        </div>
        {action && <div className="mt-1">{action}</div>}
    </div>
);

/* ──────────────────── ICONS ──────────────────── */
const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9B9890]">
        <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
    </svg>
);
const DragHandle = () => (
    <svg width="9" height="13" viewBox="0 0 10 14" fill="none" className="text-[#C8C5BD] opacity-0 group-hover:opacity-100 transition-opacity">
        <circle cx="2" cy="2" r="1" fill="currentColor"/><circle cx="8" cy="2" r="1" fill="currentColor"/>
        <circle cx="2" cy="7" r="1" fill="currentColor"/><circle cx="8" cy="7" r="1" fill="currentColor"/>
        <circle cx="2" cy="12" r="1" fill="currentColor"/><circle cx="8" cy="12" r="1" fill="currentColor"/>
    </svg>
);
const LockIcon = () => (
    <svg width="9" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#9B9890]">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);
const ResetIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>
    </svg>
);
const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
    </svg>
);
const XIcon = ({ size = 9 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);
const SortIcon = ({ dir }) => {
    if (!dir) return (
        <svg width="9" height="11" viewBox="0 0 12 14" fill="none" className="ml-0.5 text-[#C8C5BD] opacity-0 group-hover:opacity-100 transition-opacity">
            <path d="M6 1l3 3H3z" fill="currentColor"/><path d="M6 13l-3-3h6z" fill="currentColor"/>
        </svg>
    );
    return dir === "asc" ? (
        <svg width="9" height="11" viewBox="0 0 12 14" fill="none" className="ml-0.5 text-[#1C4ED8]"><path d="M6 1l3 3H3z" fill="currentColor"/></svg>
    ) : (
        <svg width="9" height="11" viewBox="0 0 12 14" fill="none" className="ml-0.5 text-[#1C4ED8]"><path d="M6 13l-3-3h6z" fill="currentColor"/></svg>
    );
};
const FilterIcon = ({ size = 10, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
);
const DotsIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
    </svg>
);
const SaveIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
);
const PencilIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);
const CopyIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
);