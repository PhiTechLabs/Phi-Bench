import React, { useState, useEffect, useRef } from "react";
import { useDataTable } from "./useDataTable";
import { renderCell } from "./cellRenderers";

/**
 * ────────────────────────────────────────────────────────────
 *  DataTable — reusable customizable table
 * ────────────────────────────────────────────────────────────
 *  Props:
 *    columns          - Column registry (full list of possible columns)
 *    defaultVisible   - Array of keys shown by default (optional; auto from registry)
 *    data             - Array of rows. Each row MUST have an `id`
 *    storageKey       - Unique string per page; used for localStorage persistence
 *    onRowClick       - (row) => void
 *    onDelete         - (row) => void   (single-row delete via trash icon)
 *    onBulkDelete     - (ids) => void   (called from bulk action bar)
 *    bulkActions      - Extra actions: [{ label, icon, onClick: (ids) => void }]
 *    searchPlaceholder
 *    emptyState       - { title, hint, action }
 *    actions          - Custom buttons in top bar (e.g. "+ Add Candidate")
 * ────────────────────────────────────────────────────────────
 *
 *  Column shape:
 *    {
 *      key: "name",                  // matches row[key]
 *      label: "Name",
 *      width: 170,
 *      type: "text" | "chips" | "money" | "date" | "status" | ...,
 *      render: (row) => <JSX/>,      // optional — fully custom
 *      fixed: false,                 // can't be reordered/removed
 *      removable: true,              // can be removed via × button
 *      defaultVisible: true,
 *      sortable: true,
 *      sortType: "string"|"number"|"date",
 *      filterable: true,
 *      searchable: true,             // included in global search
 *      // type-specific config:
 *      statusOptions: [{value, color}], onStatusChange, onToggle, etc.
 *    }
 * ────────────────────────────────────────────────────────────
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
}) => {
  const defaultVisibleKeys = defaultVisible || registry.filter((c) => c.defaultVisible).map((c) => c.key);

  const t = useDataTable({
    registry,
    defaultVisibleKeys,
    storageKey,
    data,
  });

  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showFilterFor, setShowFilterFor] = useState(null);

  return (
    <div className="w-full">
      {/* ──────────── TOP BAR ──────────── */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        {/* spacer / external title slot — page wraps with its own title */}
        <div />

        <div className="flex items-center gap-2">
          {/* <div className="relative">
            <SearchIcon />
            <input
              value={t.search}
              onChange={(e) => t.setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-[260px] rounded-[8px] border border-[#E0DDD6] bg-white pl-8 pr-3 text-[12.5px] text-[#1C1B18] outline-none transition-all placeholder:text-[#9B9890] focus:border-[#93AEFF] focus:ring-[3px] focus:ring-[#6382FF]/20"
            />
          </div> */}

          {t.hasActiveFilters && (
            <button
              onClick={t.clearAllFilters}
              className="flex h-9 items-center gap-1 rounded-[8px] border border-[#FED7AA] bg-[#FFF7ED] px-2.5 text-[12px] font-medium text-[#C2410C] transition-all hover:bg-[#FFEDD5]"
            >
              Clear filters
            </button>
          )}

          {/* <button
            onClick={t.resetColumns}
            title="Reset to default columns"
            className="flex h-9 items-center gap-1 rounded-[8px] border border-[#E0DDD6] bg-white px-2.5 text-[12px] font-medium text-[#4A4845] transition-all hover:bg-[#F5F4F0]"
          >
            <ResetIcon /> Reset
          </button> */}

          {actions}
        </div>
      </div>

      {/* ──────────── BULK ACTION BAR (appears when rows selected) ──────────── */}
      {t.selectedIds.size > 0 && (
        <div className="mb-2 flex items-center justify-between rounded-[10px] border border-[#BFD3FF] bg-[#F0F5FF] px-4 py-2.5 text-[12.5px]">
          <div className="flex items-center gap-3">
            <span className="font-medium text-[#1C4ED8]">{t.selectedIds.size} selected</span>
            <button onClick={t.clearSelection} className="text-[12px] text-[#1C4ED8] underline-offset-2 hover:underline">
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, i) => (
              <button
                key={i}
                onClick={() => action.onClick(Array.from(t.selectedIds))}
                className="flex items-center gap-1 rounded-[8px] border border-[#BFD3FF] bg-white px-3 py-1.5 text-[12px] font-medium text-[#1C4ED8] transition-all hover:bg-[#F0F5FF]"
              >
                {action.label}
              </button>
            ))}
            {onBulkDelete && (
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${t.selectedIds.size} selected items?`)) {
                    onBulkDelete(Array.from(t.selectedIds));
                    t.clearSelection();
                  }
                }}
                className="flex items-center gap-1 rounded-[8px] border border-[#FECACA] bg-white px-3 py-1.5 text-[12px] font-medium text-[#DC2626] transition-all hover:bg-[#FEF2F2]"
              >
                Delete selected
              </button>
            )}
          </div>
        </div>
      )}

      {/* ──────────── TABLE CARD ──────────── */}
      <div className="rounded-xl border border-[#E8E6E0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* Hint bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl border-b border-[#F0EDE8] bg-[#FAFAF8] px-4 py-2 text-[10.5px] text-[#9B9890]">
          <span className="flex items-center gap-1.5">
            <DragHintIcon />
            Drag headers to reorder · Click to sort · Hover to remove
          </span>
          <div className="relative flex gap-2 p-1">
            <button
              onClick={() => setShowAddColumn((s) => !s)}
              disabled={t.availableToAdd.length === 0}
              className="flex items-center gap-1 rounded-md border border-[#BFD3FF] bg-[#F0F5FF] px-2 py-1 text-[10.5px] font-medium text-[#1C4ED8] transition-all hover:bg-[#E4ECFF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-[12px] leading-none">+</span> Add Column
              {t.availableToAdd.length > 0 && (
                <span className="ml-0.5 rounded-full bg-[#1C4ED8] px-1.5 text-[9px] font-semibold text-white">
                  {t.availableToAdd.length}
                </span>
              )}
            </button>
            <button
            onClick={t.resetColumns}
            title="Reset to default columns"
            className="flex h-9 items-center gap-1 rounded-[8px] border border-[#E0DDD6] bg-white px-2.5 text-[12px] font-medium text-[#4A4845] transition-all hover:bg-[#F5F4F0]"
          >
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


        {/* Table */}
        <div className="overflow-x-auto overflow-y-visible">
          <table
            className="w-full border-collapse text-[12.5px]"
            style={{ minWidth: t.columns.reduce((s, c) => s + c.width, 0) + 88 }}
          >
            <thead>
              <tr className="bg-[#FAFAF8]">
                {/* Selection checkbox column */}
                <th style={{ width: 40, minWidth: 40 }} className="border-b border-[#E8E6E0] bg-[#F5F4F0] px-3 py-2 text-center">
                  <Checkbox
                    checked={t.allOnPageSelected}
                    indeterminate={!t.allOnPageSelected && t.someOnPageSelected}
                    onChange={t.togglePageAll}
                  />
                </th>

                {t.columns.map((col, idx) => {
                  const isDragging = t.dragKey === col.key;
                  const isOver     = t.overKey === col.key && t.dragKey && t.dragKey !== col.key;
                  const sortActive = t.sort.key === col.key;
                  const distincts  = t.columnDistinctValues[col.key] || [];
                  return (
                    <th
                      key={col.key}
                      draggable={!col.fixed}
                      onDragStart={(e) => t.onHeaderDragStart(e, col)}
                      onDragOver={(e) => t.onHeaderDragOver(e, col)}
                      onDrop={(e) => t.onHeaderDrop(e, col)}
                      onDragEnd={t.resetDrag}
                      style={{ width: col.width, minWidth: col.width }}
                      className={`group relative select-none border-b border-[#E8E6E0] px-3 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#6B6860] transition-colors ${
                        col.fixed
                          ? "cursor-default bg-[#F5F4F0]"
                          : "cursor-grab hover:bg-[#F5F4F0] active:cursor-grabbing"
                      } ${isDragging ? "opacity-40" : ""} ${idx !== t.columns.length - 1 ? "border-r border-[#F0EDE8]" : ""}`}
                    >
                      {isOver && t.dropSide === "left"  && <span className="pointer-events-none absolute left-0 top-0 h-full w-[3px] bg-[#1C4ED8]" />}
                      {isOver && t.dropSide === "right" && <span className="pointer-events-none absolute right-0 top-0 h-full w-[3px] bg-[#1C4ED8]" />}

                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`flex flex-1 items-center gap-1 truncate ${col.sortable ? "cursor-pointer" : ""}`}
                          onClick={(e) => {
                            if (!col.sortable) return;
                            e.stopPropagation();
                            t.toggleSort(col.key);
                          }}
                        >
                          {col.fixed ? <LockIcon /> : <DragHandle />}
                          <span className="truncate">{col.label}</span>
                          {col.sortable && (
                            <SortIcon dir={sortActive ? t.sort.dir : null} />
                          )}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {col.filterable && distincts.length > 0 && (
                            <FilterButton
                              active={!!t.filters[col.key]}
                              open={showFilterFor === col.key}
                              onToggle={() => setShowFilterFor((k) => (k === col.key ? null : col.key))}
                              options={distincts}
                              selected={t.filters[col.key] ? Array.from(t.filters[col.key]) : []}
                              onChange={(vals) => t.setColumnFilter(col.key, vals)}
                              onClose={() => setShowFilterFor(null)}
                            />
                          )}
                          {col.removable !== false && !col.fixed && (
                            <button
                              onClick={(e) => { e.stopPropagation(); t.removeColumn(col.key); }}
                              title="Remove column"
                              className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded text-[#C8C5BD] opacity-0 transition-all hover:bg-[#FEF2F2] hover:text-[#DC2626] group-hover:opacity-100"
                            >
                              <XIcon />
                            </button>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
                {onDelete && <th style={{ width: 44, minWidth: 44 }} className="border-b border-[#E8E6E0] px-2 py-2" />}
              </tr>
            </thead>

            <tbody>
              {t.pagedData.length === 0 ? (
                <tr>
                  <td colSpan={t.columns.length + 1 + (onDelete ? 1 : 0)} className="px-4 py-16 text-center">
                    <EmptyStateBlock {...emptyState} />
                  </td>
                </tr>
              ) : (
                t.pagedData.map((row, rowIdx) => {
                  const isSelected = t.selectedIds.has(row.id);
                  return (
                    <tr
                      key={row.id}
                      className={`group border-b border-[#F0EDE8] transition-colors ${
                        isSelected ? "bg-[#F0F5FF]" : "hover:bg-[#FAFAFD]"
                      } ${onRowClick ? "cursor-pointer" : ""}`}
                      onClick={() => onRowClick?.(row)}
                    >
                      <td
                        style={{ width: 40, minWidth: 40 }}
                        className="bg-[#FAFAF8] px-3 py-2 text-center align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox checked={isSelected} onChange={() => t.toggleRow(row.id)} />
                      </td>
                      {t.columns.map((col, colIdx) => (
                        <td
                          key={col.key}
                          style={{ width: col.width, minWidth: col.width }}
                          className={`px-3 py-2 align-middle text-[12.5px] text-[#1C1B18] ${
                            col.type === "sno" ? "bg-[#FAFAF8] text-center font-medium text-[#6B6860]" : ""
                          } ${colIdx !== t.columns.length - 1 ? "border-r border-[#F5F4F0]" : ""}`}
                        >
                          {renderCell({
                            column: col,
                            row,
                            rowIndex: rowIdx,
                            pageStart: (t.page - 1) * t.pageSize,
                          })}
                        </td>
                      ))}
                      {onDelete && (
                        <td
                          style={{ width: 44, minWidth: 44 }}
                          className="px-2 py-2 text-right align-middle"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(row); }}
                            title="Delete"
                            className="inline-flex h-7 w-7 items-center justify-center rounded text-[#9B9890] opacity-0 transition-all hover:bg-[#FEF2F2] hover:text-[#DC2626] group-hover:opacity-100"
                          >
                            <TrashIcon />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {t.totalRows > 0 && (
          <PaginationFooter
            page={t.page}
            totalPages={t.totalPages}
            totalRows={t.totalRows}
            pageSize={t.pageSize}
            onPageChange={t.setPage}
            onPageSizeChange={t.setPageSize}
          />
        )}
      </div>
    </div>
  );
};

export default DataTable;

/* ──────────────────── PAGINATION ──────────────────── */

const PaginationFooter = ({ page, totalPages, totalRows, pageSize, onPageChange, onPageSizeChange }) => {
  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, totalRows);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-xl border-t border-[#F0EDE8] bg-[#FAFAF8] px-4 py-2 text-[11px] text-[#6B6860]">
      <div className="flex items-center gap-3">
        <span>Showing {start}–{end} of {totalRows}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10.5px] text-[#9B9890]">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="cursor-pointer rounded border border-[#E0DDD6] bg-white px-1.5 py-0.5 text-[11px] outline-none focus:border-[#93AEFF]"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <PageBtn onClick={() => onPageChange(1)} disabled={page === 1}>«</PageBtn>
        <PageBtn onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</PageBtn>
        <span className="px-2 text-[11px] font-medium text-[#1C1B18]">
          {page} / {totalPages}
        </span>
        <PageBtn onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>›</PageBtn>
        <PageBtn onClick={() => onPageChange(totalPages)} disabled={page === totalPages}>»</PageBtn>
      </div>
    </div>
  );
};

const PageBtn = ({ onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex h-6 w-6 items-center justify-center rounded border border-[#E0DDD6] bg-white text-[11px] font-medium text-[#4A4845] transition-all hover:bg-[#F5F4F0] disabled:cursor-not-allowed disabled:opacity-40"
  >
    {children}
  </button>
);

/* ──────────────────── CHECKBOX ──────────────────── */

const Checkbox = ({ checked, indeterminate, onChange }) => {
  const ref = useRef();
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      className="h-3.5 w-3.5 cursor-pointer accent-[#1C4ED8]"
    />
  );
};

/* ──────────────────── ADD COLUMN DROPDOWN ──────────────────── */

const AddColumnDropdown = ({ options, onPick, onClose }) => {
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-full z-50 mt-1 w-[210px] overflow-hidden rounded-[8px] border border-[#E8E6E0] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <div className="border-b border-[#F0EDE8] bg-[#FAFAF8] px-3 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-[#9B9890]">
        Add Column ({options.length})
      </div>
      <div className="max-h-[400px] overflow-y-auto py-1">
        {options.map((col) => (
          <button
            key={col.key}
            onClick={() => onPick(col)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11.5px] text-[#1C1B18] transition-colors hover:bg-[#F0F5FF] hover:text-[#1C4ED8]"
          >
            <span className="text-[12px] leading-none text-[#9B9890]">+</span>
            {col.label}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ──────────────────── FILTER BUTTON + DROPDOWN ──────────────────── */

const FilterButton = ({ active, open, onToggle, options, selected, onChange, onClose }) => {
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  const togglePick = (val) => {
    if (selected.includes(val)) onChange(selected.filter((v) => v !== val));
    else onChange([...selected, val]);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        title="Filter"
        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded transition-all ${
          active
            ? "text-[#1C4ED8] opacity-100"
            : "text-[#C8C5BD] opacity-0 hover:bg-[#F0F5FF] hover:text-[#1C4ED8] group-hover:opacity-100"
        }`}
      >
        <FilterIcon />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-[200px] overflow-hidden rounded-[8px] border border-[#E8E6E0] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-[#F0EDE8] bg-[#FAFAF8] px-2.5 py-1.5">
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-[#9B9890]">Filter</span>
            {selected.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="text-[10px] font-medium text-[#1C4ED8] hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="max-h-[260px] overflow-y-auto py-1">
            {options.map((opt) => (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-2 px-2.5 py-1 text-[11px] text-[#1C1B18] transition-colors hover:bg-[#FAFAF8]"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => togglePick(opt)}
                  className="h-3 w-3 cursor-pointer accent-[#1C4ED8]"
                />
                <span className="truncate">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ──────────────────── EMPTY ──────────────────── */

const EmptyStateBlock = ({ title, hint, action }) => (
  <div className="flex flex-col items-center gap-2.5">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F4F0] text-[#9B9890]">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6M9 13h6M9 17h4" />
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
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const DragHandle = () => (
  <svg width="9" height="13" viewBox="0 0 10 14" fill="none" className="text-[#C8C5BD] opacity-0 transition-opacity group-hover:opacity-100">
    <circle cx="2" cy="2" r="1" fill="currentColor" /><circle cx="8" cy="2" r="1" fill="currentColor" />
    <circle cx="2" cy="7" r="1" fill="currentColor" /><circle cx="8" cy="7" r="1" fill="currentColor" />
    <circle cx="2" cy="12" r="1" fill="currentColor" /><circle cx="8" cy="12" r="1" fill="currentColor" />
  </svg>
);
const LockIcon = () => (
  <svg width="9" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#9B9890]">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const DragHintIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 9l-3 3 3 3" /><path d="M9 5l3-3 3 3" /><path d="M15 19l-3 3-3-3" /><path d="M19 9l3 3-3 3" /><path d="M2 12h20M12 2v20" />
  </svg>
);
const ResetIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);
const XIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const SortIcon = ({ dir }) => {
  if (!dir) {
    return (
      <svg width="9" height="11" viewBox="0 0 12 14" fill="none" className="ml-0.5 text-[#C8C5BD] opacity-0 transition-opacity group-hover:opacity-100">
        <path d="M6 1l3 3H3z" fill="currentColor" />
        <path d="M6 13l-3-3h6z" fill="currentColor" />
      </svg>
    );
  }
  return dir === "asc" ? (
    <svg width="9" height="11" viewBox="0 0 12 14" fill="none" className="ml-0.5 text-[#1C4ED8]">
      <path d="M6 1l3 3H3z" fill="currentColor" />
    </svg>
  ) : (
    <svg width="9" height="11" viewBox="0 0 12 14" fill="none" className="ml-0.5 text-[#1C4ED8]">
      <path d="M6 13l-3-3h6z" fill="currentColor" />
    </svg>
  );
};
const FilterIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);