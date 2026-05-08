import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable/DataTable";
import {
  listBench,
  toggleBenchStatus,
  updateBenchEntry,
  removeFromBench,
} from "../api/benchApi";

/* ──────────────────── STATUS PIPELINE ──────────────────── */
const STATUS_OPTIONS = [
  { value: "New",         color: "bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]" },
  { value: "Screening",   color: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]" },
  { value: "Shortlisted", color: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]" },
  { value: "Interview",   color: "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]" },
  { value: "Offer",       color: "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]" },
  { value: "Hired",       color: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]" },
  { value: "Rejected",    color: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]" },
  { value: "On Hold",     color: "bg-[#F5F4F0] text-[#6B6860] border-[#E0DDD6]" },
  { value: "Withdrawn",   color: "bg-[#FAFAF8] text-[#9B9890] border-[#E0DDD6]" },
];

/* ──────────────────── COMPONENT ──────────────────── */

const Bench = () => {
  const [list, setList]               = useState([]);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    setList(await listBench());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  /* ── handlers ── */
  const handleRemove = (row) => setConfirmRemove(row);
  const confirmRemoveAction = async () => {
    await removeFromBench(confirmRemove.id);
    await refresh();
    setConfirmRemove(null);
  };
  const handleBulkRemove = async (ids) => {
    await Promise.all(ids.map((id) => removeFromBench(id)));
    await refresh();
  };
  const handleToggleBench = async (id) => {
    // Flipping bench off here removes the row from this view on next refresh.
    await toggleBenchStatus(id);
    await refresh();
  };
  const handleStatusChange = async (id, newStatus) => {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    await updateBenchEntry(id, { status: newStatus });
  };

  /* ── column registry ── */
  const columns = [
    { key: "sno",        label: "S.No",     width: 56,  type: "sno",        fixed: true, removable: false, defaultVisible: true, searchable: false },
    { key: "name",       label: "Name",     width: 170, type: "text",       bold: true, link: true, removable: false, defaultVisible: true, sortable: true, searchable: true },
    { key: "jobTitle",   label: "Job Title",width: 150, type: "text",       defaultVisible: true, sortable: true, searchable: true, filterable: true },
    { key: "skills",     label: "Skills",   width: 240, type: "chips",      maxChips: 3, defaultVisible: true, searchable: true },
    { key: "experience", label: "Exp.",     width: 80,  type: "experience", defaultVisible: true, sortable: true, sortType: "number" },
    { key: "company",    label: "Last Company", width: 150, type: "text",   defaultVisible: true, sortable: true, searchable: true, filterable: true },
    { key: "city",       label: "Location", width: 130, type: "location",   defaultVisible: true, sortable: true, filterable: true },
    { key: "expectedSalary", label: "Expected", width: 120, type: "money",  defaultVisible: true, sortable: true, sortType: "number" },
    { key: "noticePeriod",   label: "Notice",   width: 110, type: "text",   defaultVisible: true, filterable: true },
    {
      key: "onBench", label: "Bench", width: 80, type: "toggle",
      onToggle: handleToggleBench, defaultVisible: true,
    },
    {
      key: "status", label: "Status", width: 130, type: "status",
      statusOptions: STATUS_OPTIONS, onStatusChange: handleStatusChange,
      defaultVisible: true, sortable: true, filterable: true,
    },
    { key: "email",         label: "Email",         width: 200, type: "text", searchable: true },
    { key: "phone",         label: "Phone",         width: 130, type: "text" },
    { key: "qualification", label: "Qualification", width: 140, type: "text", sortable: true, filterable: true },
    { key: "linkedin",      label: "LinkedIn",      width: 180, type: "text" },
    { key: "currentSalary", label: "Current Salary",width: 130, type: "money", sortable: true, sortType: "number" },
    { key: "country",       label: "Country",       width: 120, type: "text",  sortable: true, filterable: true },
    { key: "state",         label: "State",         width: 120, type: "text",  filterable: true },
    { key: "createdAt",     label: "Date Added",    width: 120, type: "date",  sortable: true, sortType: "date" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      <div className="mx-auto max-w-7xl px-8 py-8">

        {/* PAGE HEADER */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[20px] font-semibold leading-tight text-[#1C1B18]">Bench</h1>
            <p className="mt-0.5 text-[12px] text-[#9B9890]">
              Candidates currently available for new opportunities
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <SearchIcon />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bench…"
                className="h-10 w-70 rounded-[10px] border border-[#E0DDD6] bg-white pl-9 pr-3 text-[13px] text-[#1C1B18] outline-none transition-all focus:border-[#93AEFF] focus:ring-[3px] focus:ring-[#6382FF]/20"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <DataTable
          columns={columns}
          data={list}
          storageKey="bench_table"
          onRowClick={(row) => navigate(`/candidates/${row.id}`)}
          onDelete={handleRemove}
          onBulkDelete={handleBulkRemove}
          searchPlaceholder="Search name, skill, company…"
          emptyState={{
            title: "No candidates on bench",
            hint: "Toggle the bench switch on any candidate to add them here",
          }}
        />
      </div>

const BenchCard = ({ candidate, onOpen, onRemove }) => (
  <div
    onClick={onOpen}
    className="group cursor-pointer overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white p-5 transition-all hover:border-[#BFD3FF] hover:shadow-[0_4px_16px_rgba(28,78,216,0.08)]"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#1C4ED8] to-[#4F6FE8] text-[14px] font-semibold text-white shadow-[0_2px_4px_rgba(28,78,216,0.25)]">
          {candidate.initials || "?"}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold text-[#1C1B18] group-hover:text-[#1C4ED8]">
            {candidate.name || "Unnamed"}
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="Remove from bench"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#9B9890] opacity-0 transition-all hover:bg-[#FEF2F2] hover:text-[#DC2626] group-hover:opacity-100"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <div className="mt-4 flex flex-wrap gap-1">
      {(candidate.skills || "")
        .split(",")
        .slice(0, 4)
        .map((s, i) => {
          const t = s.trim();
          if (!t) return null;
          return (
            <span
              key={i}
              className="rounded-md border border-[#E0DDD6] bg-[#FAFAF8] px-2 py-0.5 text-[11px] font-medium text-[#4A4845]"
            >
              {t}
            </span>
          );
        })}
    </div>

    <div className="mt-4 flex items-center justify-between border-t border-[#F0EDE8] pt-3 text-[11px] text-[#9B9890]">
      <span>{candidate.experienceYears ? `${candidate.experienceYears} yrs exp` : "Experience —"}</span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 font-medium text-[#1D4ED8]">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        On Bench
      </span>
    </div>
  </div>
);

/* ──────────────────── EMPTY STATE ──────────────────── */

const EmptyState = () => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E8E6E0] bg-white py-20 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F4F0] text-[#9B9890]">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 12h8M8 8h8M8 16h5" />
      </svg>
    </div>
  );
};

export default Bench;