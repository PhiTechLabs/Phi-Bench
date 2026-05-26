import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InterviewForm from "./InterviewForm";
import DataTable from "../components/DataTable/DataTable";
import {
  listInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} from "../api/interviewsApi";
import useRoleBase from "../hooks/useRoleBase.";

/* ──────────────────── STATUS PIPELINE ──────────────────── */
const STATUS_OPTIONS = [
  { value: "Scheduled",   color: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]" },
  { value: "Completed",   color: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]" },
  { value: "Rescheduled", color: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]" },
  { value: "Cancelled",   color: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]" },
  { value: "No Show",     color: "bg-[#FAFAF8] text-[#9B9890] border-[#E0DDD6]" },
];

const ROUND_OPTIONS = [
  { value: "Screening",   color: "bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]" },
  { value: "Technical",   color: "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]" },
  { value: "Managerial",  color: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]" },
  { value: "HR",          color: "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]" },
  { value: "Final",       color: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]" },
];

const MODE_OPTIONS = [
  { value: "Video",     color: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]" },
  { value: "Phone",     color: "bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]" },
  { value: "Onsite",    color: "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]" },
  { value: "Take-home", color: "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]" },
];

/* ──────────────────── COMPONENT ──────────────────── */

const Interviews = () => {
  const [showForm, setShowForm]     = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [confirmDel, setConfirmDel] = useState(null);
  const navigate = useNavigate();
  const roleBase = useRoleBase();

  const refresh = useCallback(async () => {
    setInterviews(await listInterviews());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  /* ── handlers ── */
  const handleAdd = async (data) => {
    await createInterview(data);
    await refresh();
    setShowForm(false);
  };
  const handleDelete = (row) => setConfirmDel(row);
  const confirmDelete = async () => {
    await deleteInterview(confirmDel.id);
    await refresh();
    setConfirmDel(null);
  };
  const handleBulkDelete = async (ids) => {
    await Promise.all(ids.map((id) => deleteInterview(id)));
    await refresh();
  };
  const handleStatusChange = async (id, newStatus) => {
    const previous = interviews.find((iv) => iv.id === id);
    setInterviews((prev) => prev.map((iv) => (iv.id === id ? { ...iv, status: newStatus } : iv)));
    try {
      await updateInterview(id, { status: newStatus });
    } catch {
      setInterviews((prev) => prev.map((iv) => (iv.id === id ? previous : iv)));
    }
  };
  const handleRoundChange = async (id, newRound) => {
    setInterviews((prev) => prev.map((iv) => (iv.id === id ? { ...iv, round: newRound } : iv)));
    await updateInterview(id, { round: newRound });
  };
  const handleModeChange = async (id, newMode) => {
    setInterviews((prev) => prev.map((iv) => (iv.id === id ? { ...iv, mode: newMode } : iv)));
    await updateInterview(id, { mode: newMode });
  };

  /* ── column registry ── */
  const columns = [
    { key: "sno",          label: "S.No",          width: 56,  type: "sno",  fixed: true, removable: false, defaultVisible: true, searchable: false },
    { key: "candidateName",label: "Candidate",     width: 170, type: "text", bold: true, link: true, avatar: true, removable: false, defaultVisible: true, sortable: true, searchable: true },
    { key: "jobTitle",     label: "Position",      width: 170, type: "text", defaultVisible: true, sortable: true, searchable: true, filterable: true },
    { key: "client",       label: "Client",        width: 150, type: "text", defaultVisible: true, sortable: true, searchable: true, filterable: true },
    {
      key: "round", label: "Round", width: 130, type: "status",
      statusOptions: ROUND_OPTIONS, onStatusChange: handleRoundChange,
      defaultVisible: true, sortable: true, filterable: true,
    },
    {
      key: "mode", label: "Mode", width: 110, type: "status",
      statusOptions: MODE_OPTIONS, onStatusChange: handleModeChange,
      defaultVisible: true, filterable: true,
    },
    { key: "dateTime",     label: "Date & Time",   width: 160, type: "date", defaultVisible: true, sortable: true, sortType: "date" },
    { key: "interviewer",  label: "Interviewer",   width: 150, type: "text", defaultVisible: true, searchable: true, filterable: true },
    {
      key: "status", label: "Status", width: 130, type: "status",
      statusOptions: STATUS_OPTIONS, onStatusChange: handleStatusChange,
      defaultVisible: true, sortable: true, filterable: true,
    },
    { key: "feedback",     label: "Feedback",      width: 180, type: "text" },
    { key: "recruiter",    label: "Recruiter",     width: 140, type: "text", searchable: true, filterable: true },
    { key: "location",     label: "Location",      width: 140, type: "text", filterable: true },
    { key: "createdAt",    label: "Created",       width: 120, type: "date", sortable: true, sortType: "date" },
  ];

  if (showForm) {
    return <InterviewForm setShowForm={setShowForm} onSave={handleAdd} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      {/* ════════ COMPACT HEADER BAR ════════ */}
      <div className="border-b border-[#E8E6E0] bg-white">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center gap-2 rounded-lg border border-[#E0DDD6] bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#4A4845] hover:bg-[#F5F4F0]">
              My Interviews
              <span className="rounded-full bg-[#F1EFE8] px-1.5 py-0.5 text-[10px] text-[#4A4845]">
                {interviews.length}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[11px] font-medium text-[#6B6860] hover:text-[#1C4ED8]">
              Customize table
            </button>
            <button className="text-[11px] font-medium text-[#6B6860] hover:text-[#1C4ED8]">
              Calendar View
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex h-8 items-center gap-1 rounded-lg bg-[#1C4ED8] px-3 text-[11.5px] font-medium text-white shadow-[0_1px_3px_rgba(28,78,216,0.3)] transition-all hover:bg-[#1741B6]"
            >
              <span className="text-[14px] leading-none">+</span> Schedule Interview
            </button>
          </div>
        </div>
      </div>

      {/* ════════ TABLE (EDGE-TO-EDGE) ════════ */}
      <div className="w-full">
        <DataTable
          columns={columns}
          data={interviews}
          storageKey="interviews_table"
          onRowClick={(row) => navigate(`${roleBase}/interviews/${row.id}`)}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          searchPlaceholder="Search candidate, position, interviewer…"
          emptyState={{
            title: "No interviews scheduled",
            hint: "Click + Schedule Interview to get started",
          }}
        />
      </div>

      {/* ════════ DELETE CONFIRM ════════ */}
      {confirmDel && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm" onClick={() => setConfirmDel(null)}>
          <div className="w-full max-w-100 rounded-2xl border border-[#E8E6E0] bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-[15px] font-semibold text-[#1C1B18]">Delete interview?</div>
            <p className="mt-1.5 text-[12.5px] leading-normal text-[#6B6860]">
              Interview for <span className="font-medium text-[#1C1B18]">{confirmDel.candidateName || "this candidate"}</span> will be permanently removed.
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

export default Interviews; 