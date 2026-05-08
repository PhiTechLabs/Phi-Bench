import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CandidateForm from "./CandidateForm";
import DataTable from "../components/DataTable/DataTable";
import {
  listCandidates,
  createCandidate,
  deleteCandidate,
  toggleBench,
  updateCandidate,
  migrateExistingCandidates,
} from "../api/candidatesApi";

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

const Candidates = () => {
  const [showForm, setShowForm]     = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [confirmDel, setConfirmDel] = useState(null);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    setCandidates(await listCandidates());
  }, []);
  useEffect(() => {
    migrateExistingCandidates();
    refresh();
  }, [refresh]);

  /* ── handlers ── */
  const handleAdd = async (data) => {
    await createCandidate(data);
    await refresh();
    setShowForm(false);
  };
  const handleDelete = async (row) => setConfirmDel(row);
  const confirmDelete = async () => {
    await deleteCandidate(confirmDel.id);
    await refresh();
    setConfirmDel(null);
  };
  const handleBulkDelete = async (ids) => {
    await Promise.all(ids.map((id) => deleteCandidate(id)));
    await refresh();
  };
  const handleToggleBench = async (id) => {
    await toggleBench(id);
    await refresh();
  };
  const handleStatusChange = async (id, newStatus) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    await updateCandidate(id, { status: newStatus });
  };

  /* ── column registry ── */
  const columns = [
    { key: "sno",        label: "S.No",     width: 56,  type: "sno",       fixed: true, removable: false, defaultVisible: true, searchable: false },
    { key: "name",       label: "Name",     width: 170, type: "text",      bold: true, link: true, removable: false, defaultVisible: true, sortable: true, searchable: true },
    { key: "jobTitle",   label: "Job Title",width: 150, type: "text",      defaultVisible: true, sortable: true, searchable: true, filterable: true },
    { key: "skills",     label: "Skills",   width: 220, type: "chips",     maxChips: 2, defaultVisible: true, searchable: true },
    { key: "experience", label: "Exp.",     width: 80,  type: "experience", defaultVisible: true, sortable: true, sortType: "number" },
    { key: "company",    label: "Company",  width: 140, type: "text",      defaultVisible: true, sortable: true, searchable: true, filterable: true },
    { key: "city",       label: "Location", width: 130, type: "location",  defaultVisible: true, sortable: true, filterable: true },
    { key: "email",      label: "Email",    width: 200, type: "text",      defaultVisible: true, searchable: true },
    { key: "phone",      label: "Phone",    width: 130, type: "text",      defaultVisible: true },
    {
      key: "onBench", label: "Bench", width: 80, type: "toggle",
      onToggle: handleToggleBench, defaultVisible: true, filterable: true,
    },
    {
      key: "status", label: "Status", width: 130, type: "status",
      statusOptions: STATUS_OPTIONS, onStatusChange: handleStatusChange,
      defaultVisible: true, sortable: true, filterable: true,
    },
    { key: "qualification",  label: "Qualification",   width: 140, type: "text",  sortable: true, filterable: true },
    { key: "linkedin",       label: "LinkedIn",        width: 180, type: "text" },
    { key: "expectedSalary", label: "Expected Salary", width: 130, type: "money", sortable: true, sortType: "number" },
    { key: "currentSalary",  label: "Current Salary",  width: 130, type: "money", sortable: true, sortType: "number" },
    { key: "country",        label: "Country",         width: 120, type: "text",  sortable: true, filterable: true },
    { key: "state",          label: "State",           width: 120, type: "text",  filterable: true },
    { key: "noticePeriod",   label: "Notice Period",   width: 120, type: "text",  filterable: true },
    { key: "createdAt",      label: "Date Added",      width: 120, type: "date",  sortable: true, sortType: "date" },
  ];

  if (showForm) {
    return <CandidateForm setShowForm={setShowForm} onSave={handleAdd} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      <div className="w-full px-4 py-3 sm:px-6 sm:py-4 lg:px-8 2xl:px-12">

        {/* PAGE HEADER */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[20px] font-semibold leading-tight text-[#1C1B18]">Candidates</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex h-9 items-center gap-1 rounded-lg bg-[#1C4ED8] px-3.5 text-[12.5px] font-medium text-white shadow-[0_1px_3px_rgba(28,78,216,0.3)] transition-all hover:bg-[#1741B6]"
          >
            <span className="text-[15px] leading-none">+</span> Add Candidate
          </button>
        </div>

        {/* TABLE */}
        <DataTable
          columns={columns}
          data={candidates}
          storageKey="candidates_table"
          onRowClick={(row) => navigate(`/candidates/${row.id}`)}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          searchPlaceholder="Search name, skill, company…"
          emptyState={{
            title: "No candidates yet",
            hint: "Click + Add Candidate to get started",
          }}
        />
      </div>

      {/* DELETE CONFIRM */}
      {confirmDel && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm" onClick={() => setConfirmDel(null)}>
          <div className="w-full max-w-100 rounded-2xl border border-[#E8E6E0] bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-[15px] font-semibold text-[#1C1B18]">Delete candidate?</div>
            <p className="mt-1.5 text-[12.5px] leading-normal text-[#6B6860]">
              <span className="font-medium text-[#1C1B18]">{confirmDel.name || "This candidate"}</span> will be permanently removed. This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmDel(null)} className="rounded-lg border border-[#E0DDD6] bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[#4A4845] hover:bg-[#F5F4F0]">Cancel</button>
              <button onClick={confirmDelete} className="rounded-lg bg-[#DC2626] px-3.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-[#B91C1C]">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;