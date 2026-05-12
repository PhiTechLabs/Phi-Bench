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

/* ──────────────────── STATUS PIPELINE ──────────────────── */
const STATUS_OPTIONS = [
  { value: "Submitted",          color: "bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]" },
  { value: "Client Review",      color: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]" },
  { value: "Shortlisted",        color: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]" },
  { value: "Interview Scheduled",color: "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]" },
  { value: "Offer",              color: "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]" },
  { value: "Placed",             color: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]" },
  { value: "Rejected",           color: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]" },
  { value: "Withdrawn",          color: "bg-[#FAFAF8] text-[#9B9890] border-[#E0DDD6]" },
];

/* ──────────────────── COMPONENT ──────────────────── */

const Submissions = () => {
  const [showForm, setShowForm]       = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [confirmDel, setConfirmDel]   = useState(null);
  const navigate = useNavigate();

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
    const previous = submissions.find((s) => s.id === id);
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
    try {
      await updateSubmission(id, { status: newStatus });
    } catch {
      setSubmissions((prev) => prev.map((s) => (s.id === id ? previous : s)));
    }
  };

  /* ── column registry ── */
  const columns = [
    { key: "sno",            label: "S.No",          width: 56,  type: "sno",  fixed: true, removable: false, defaultVisible: true, searchable: false },
    { key: "candidateName",  label: "Candidate",     width: 170, type: "text", bold: true, link: true, removable: false, defaultVisible: true, sortable: true, searchable: true },
    { key: "jobTitle",       label: "Position",      width: 170, type: "text", defaultVisible: true, sortable: true, searchable: true, filterable: true },
    { key: "client",         label: "Client",        width: 150, type: "text", defaultVisible: true, sortable: true, searchable: true, filterable: true },
    { key: "submittedBy",    label: "Submitted By",  width: 140, type: "text", defaultVisible: true, searchable: true, filterable: true },
    { key: "submissionDate", label: "Submitted",     width: 120, type: "date", defaultVisible: true, sortable: true, sortType: "date" },
    { key: "expectedRate",   label: "Rate / Salary", width: 130, type: "money",defaultVisible: true, sortable: true, sortType: "number" },
    { key: "vendor",         label: "Vendor",        width: 140, type: "text", defaultVisible: true, searchable: true, filterable: true },
    {
      key: "status", label: "Status", width: 150, type: "status",
      statusOptions: STATUS_OPTIONS, onStatusChange: handleStatusChange,
      defaultVisible: true, sortable: true, filterable: true,
    },
    { key: "clientFeedback", label: "Client Feedback", width: 220, type: "text", searchable: true },
    { key: "notes",          label: "Notes",           width: 220, type: "text", searchable: true },
    { key: "createdAt",      label: "Created",         width: 120, type: "date", sortable: true, sortType: "date" },
  ];

  if (showForm) {
    return <SubmissionForm setShowForm={setShowForm} onSave={handleAdd} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      <div className="w-full px-4 py-3 sm:px-6 sm:py-4 lg:px-8 2xl:px-12">

        {/* PAGE HEADER */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[20px] font-semibold leading-tight text-[#1C1B18]">Submissions</h1>
            <p className="mt-0.5 text-[12px] text-[#9B9890]">
              Candidates submitted to clients and their current stage
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex h-9 items-center gap-1 rounded-lg bg-[#1C4ED8] px-3.5 text-[12.5px] font-medium text-white shadow-[0_1px_3px_rgba(28,78,216,0.3)] transition-all hover:bg-[#1741B6]"
          >
            <span className="text-[15px] leading-none">+</span> New Submission
          </button>
        </div>

        {/* TABLE */}
        <DataTable
          columns={columns}
          data={submissions}
          storageKey="submissions_table"
          onRowClick={(row) => navigate(`/candidates/${row.candidateId}`)}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          searchPlaceholder="Search candidate, position, client…"
          emptyState={{
            title: "No submissions yet",
            hint: "Click + New Submission to send a candidate to a client",
          }}
        />
      </div>

      {/* DELETE CONFIRM */}
      {confirmDel && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setConfirmDel(null)}
        >
          <div
            className="w-full max-w-100 rounded-2xl border border-[#E8E6E0] bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[15px] font-semibold text-[#1C1B18]">Delete submission?</div>
            <p className="mt-1.5 text-[12.5px] leading-normal text-[#6B6860]">
              The submission for{" "}
              <span className="font-medium text-[#1C1B18]">
                {confirmDel.candidateName || "this candidate"}
              </span>{" "}
              will be permanently removed.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDel(null)}
                className="rounded-lg border border-[#E0DDD6] bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[#4A4845] hover:bg-[#F5F4F0]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-lg bg-[#DC2626] px-3.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-[#B91C1C]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;