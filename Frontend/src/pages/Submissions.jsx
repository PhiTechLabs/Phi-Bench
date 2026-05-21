import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SubmissionForm from "./SubmissionForm";
import DataTable from "../components/DataTable/DataTable";
import {
  listSubmissions,
  createSubmission,
  updateSubmission,
  deleteSubmission,
} from "../api/submissionsApi";
import useRoleBase from "../hooks/useRoleBase";

/* ──────────────────── STATUS PIPELINE ──────────────────── */
const STATUS_OPTIONS = [
  { value: "Submitted",   color: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]" },
  { value: "Under Review",color: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]" },
  { value: "Interview",   color: "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]" },
  { value: "Offer",       color: "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]" },
  { value: "Accepted",    color: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]" },
  { value: "Rejected",    color: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]" },
  { value: "Withdrawn",   color: "bg-[#FAFAF8] text-[#9B9890] border-[#E0DDD6]" },
];

/* ──────────────────── COMPONENT ──────────────────── */

const Submissions = () => {
  const [showForm, setShowForm]         = useState(false);
  const [submissions, setSubmissions]   = useState([]);
  const [confirmDel, setConfirmDel]     = useState(null);
  const navigate = useNavigate();
  const roleBase = useRoleBase();

  const refresh = useCallback(async () => {
    setSubmissions(await listSubmissions());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  /* ── handlers ── */
  const handleAdd = async (data) => {
    await createSubmission(data);
    await refresh();
    setShowForm(false);
  };
  const handleDelete = (row) => setConfirmDel(row);
  const confirmDelete = async () => {
    await deleteSubmission(confirmDel.id);
    await refresh();
    setConfirmDel(null);
  };
  const handleBulkDelete = async (ids) => {
    await Promise.all(ids.map((id) => deleteSubmission(id)));
    await refresh();
  };
  const handleStatusChange = async (id, newStatus) => {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
    await updateSubmission(id, { status: newStatus });
  };

  /* ── column registry ── */
  const columns = [
    { key: "sno",          label: "S.No",         width: 56,  type: "sno",  fixed: true, removable: false, defaultVisible: true, searchable: false },
    { key: "candidateName",label: "Candidate",    width: 170, type: "text", bold: true, link: true, avatar: true, removable: false, defaultVisible: true, sortable: true, searchable: true },
    { key: "jobTitle",     label: "Position",     width: 180, type: "text", defaultVisible: true, sortable: true, searchable: true, filterable: true },
    { key: "client",       label: "Client",       width: 150, type: "text", defaultVisible: true, sortable: true, searchable: true, filterable: true },
    { key: "submittedBy",  label: "Submitted By", width: 140, type: "text", defaultVisible: true, sortable: true, searchable: true, filterable: true },
    { key: "submittedDate",label: "Date",         width: 120, type: "date", defaultVisible: true, sortable: true, sortType: "date" },
    {
      key: "status", label: "Status", width: 140, type: "status",
      statusOptions: STATUS_OPTIONS, onStatusChange: handleStatusChange,
      defaultVisible: true, sortable: true, filterable: true,
    },
    { key: "rate",         label: "Rate",         width: 120, type: "text", defaultVisible: true, searchable: true },
    { key: "vendorName",   label: "Vendor",       width: 150, type: "text", sortable: true, searchable: true, filterable: true },
    { key: "recruiter",    label: "Recruiter",    width: 140, type: "text", searchable: true, filterable: true },
    { key: "notes",        label: "Notes",        width: 200, type: "text" },
    { key: "createdAt",    label: "Created",      width: 120, type: "date", sortable: true, sortType: "date" },
  ];

  if (showForm) {
    return <SubmissionForm setShowForm={setShowForm} onSave={handleAdd} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      {/* ════════ COMPACT HEADER BAR ════════ */}
      <div className="border-b border-[#E8E6E0] bg-white">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center gap-2 rounded-lg border border-[#E0DDD6] bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#4A4845] hover:bg-[#F5F4F0]">
              My Submissions
              <span className="rounded-full bg-[#F1EFE8] px-1.5 py-0.5 text-[10px] text-[#4A4845]">
                {submissions.length}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[11px] font-medium text-[#6B6860] hover:text-[#1C4ED8]">
              Customize table
            </button>
            <button className="text-[11px] font-medium text-[#6B6860] hover:text-[#1C4ED8]">
              Export
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex h-8 items-center gap-1 rounded-lg bg-[#1C4ED8] px-3 text-[11.5px] font-medium text-white shadow-[0_1px_3px_rgba(28,78,216,0.3)] transition-all hover:bg-[#1741B6]"
            >
              <span className="text-[14px] leading-none">+</span> New Submission
            </button>
          </div>
        </div>
      </div>

      {/* ════════ TABLE (EDGE-TO-EDGE) ════════ */}
      <div className="w-full">
        <DataTable
          columns={columns}
          data={submissions}
          storageKey="submissions_table"
          onRowClick={(row) => navigate(`${roleBase}/submissions/${row.id}`)}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          searchPlaceholder="Search candidate, position, client…"
          emptyState={{
            title: "No submissions yet",
            hint: "Click + New Submission to get started",
          }}
        />
      </div>

      {/* ════════ DELETE CONFIRM ════════ */}
      {confirmDel && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm" onClick={() => setConfirmDel(null)}>
          <div className="w-full max-w-100 rounded-2xl border border-[#E8E6E0] bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-[15px] font-semibold text-[#1C1B18]">Delete submission?</div>
            <p className="mt-1.5 text-[12.5px] leading-normal text-[#6B6860]">
              Submission for <span className="font-medium text-[#1C1B18]">{confirmDel.candidateName || "this candidate"}</span> will be permanently removed.
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

export default Submissions;