import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import JobForm from "./JobForm";
import DataTable from "../components/DataTable/DataTable";
import {
  listJobs,
  createJob,
  updateJob,
  deleteJob,
} from "../api/jobsApi";
import useRoleBase from "../hooks/useRoleBase";
import { getCurrentUser } from "../utils/auth";
import { hasPermission } from "../utils/hasPermission";
import { PERMISSIONS } from "../pages/settings/constants/permissions";



/* ──────────────────── STATUS PIPELINE ──────────────────── */
const STATUS_OPTIONS = [
  { value: "Open",    color: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]" },
  { value: "On Hold", color: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]" },
  { value: "Filled",  color: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]" },
  { value: "Closed",  color: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]" },
];

/* ──────────────────── HELPER: extract user-friendly error ──────────────────── */
const getApiErrorMessage = (err) => {
  const data = err?.response?.data;
  if (!data) return err?.message || "Something went wrong";
  if (Array.isArray(data.errors) && data.errors.length) {
    return data.errors.map((e) => `${e.field}: ${e.message}`).join("\n");
  }
  return data.message || "Something went wrong";
};

/* ──────────────────── COMPONENT ──────────────────── */

const JobOpenings = () => {
  const [showForm, setShowForm]     = useState(false);
  const [jobs, setJobs]             = useState([]);
  const [confirmDel, setConfirmDel] = useState(null);
  const navigate = useNavigate();
  const roleBase = useRoleBase();

  const user = getCurrentUser();
  const canCreate = hasPermission(user, PERMISSIONS.JOB_CREATE);
  const canEdit = hasPermission(user, PERMISSIONS.JOB_EDIT);
  const canDelete = hasPermission(user, PERMISSIONS.JOB_DELETE);

  const refresh = useCallback(async () => {
    try {
      setJobs(await listJobs());
    } catch (err) {
      console.warn("Failed to load jobs:", err?.response?.data || err);
      alert(getApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /* ── handlers ── */
  const handleAdd = async (data) => {
    if (!canCreate) return;
    try {
      await createJob(data);
      await refresh();
      setShowForm(false);
    } catch (err) {
      console.warn("Create job failed:", err?.response?.data || err);
      alert(getApiErrorMessage(err));
    }
  };
  const handleDelete = (row) => setConfirmDel(row);
  const confirmDelete = async () => {
    try {
      await deleteJob(confirmDel.id);
      await refresh();
      setConfirmDel(null);
    } catch (err) {
      console.warn("Delete job failed:", err?.response?.data || err);
      alert(getApiErrorMessage(err));
    }
  };
  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteJob(id)));
      await refresh();
    } catch (err) {
      console.warn("Bulk delete failed:", err?.response?.data || err);
      alert(getApiErrorMessage(err));
    }
  };
  const handleStatusChange = async (id, newStatus) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j)));
    try {
      await updateJob(id, { status: newStatus });
    } catch (err) {
      console.warn("Status update failed:", err?.response?.data || err);
      alert(getApiErrorMessage(err));
      await refresh();
    }
  };

  /* ── column registry ── */
  const columns = [
    { key: "sno",        label: "S.No",          width: 56,  type: "sno",      fixed: true, removable: false, defaultVisible: true, searchable: false },
    { key: "title",      label: "Position",      width: 200, type: "text",     bold: true, link: true, avatar: true, removable: false, defaultVisible: true, sortable: true, searchable: true },
    { key: "client",     label: "Client",        width: 160, type: "text",     defaultVisible: true, sortable: true, searchable: true, filterable: true },
    { key: "skills",     label: "Skills",        width: 220, type: "chips",    maxChips: 2, defaultVisible: true, searchable: true },
    { key: "experience", label: "Exp.",          width: 90,  type: "text",     defaultVisible: true, sortable: true, searchable: true },
    { key: "jobType",    label: "Type",          width: 120, type: "text",     defaultVisible: true, sortable: true, filterable: true },
    { key: "city",       label: "Location",      width: 140, type: "location", defaultVisible: true, sortable: true, filterable: true },
    { key: "salary",     label: "Salary / Rate", width: 140, type: "text",     defaultVisible: true, searchable: true },
    {
      key: "status", label: "Status", width: 120, type: "status",
      statusOptions: STATUS_OPTIONS, onStatusChange: handleStatusChange,
      defaultVisible: true, sortable: true, filterable: true,
    },
    { key: "contact",    label: "Contact",       width: 150, type: "text", searchable: true },
    { key: "manager",    label: "Account Mgr.",  width: 150, type: "text", searchable: true, filterable: true },
    { key: "recruiter",  label: "Recruiter",     width: 150, type: "text", searchable: true, filterable: true },
    { key: "industry",   label: "Industry",      width: 140, type: "text", sortable: true, filterable: true },
    { key: "country",    label: "Country",       width: 120, type: "text", sortable: true, filterable: true },
    { key: "dateOpened", label: "Date Opened",   width: 120, type: "date", sortable: true, sortType: "date" },
    { key: "targetDate", label: "Target Date",   width: 120, type: "date", sortable: true, sortType: "date" },
    { key: "createdAt",  label: "Created",       width: 120, type: "date", sortable: true, sortType: "date" },
  ];

  if (showForm) {
    return <JobForm setShowForm={setShowForm} onSave={handleAdd} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      {/* ════════ COMPACT HEADER BAR ════════ */}
      <div className="border-b border-[#E8E6E0] bg-white">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center gap-2 rounded-lg border border-[#E0DDD6] bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#4A4845] hover:bg-[#F5F4F0]">
              My Job Openings
              <span className="rounded-full bg-[#F1EFE8] px-1.5 py-0.5 text-[10px] text-[#4A4845]">
                {jobs.length}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[11px] font-medium text-[#6B6860] hover:text-[#1C4ED8]">
              Customize table
            </button>
            <button className="text-[11px] font-medium text-[#6B6860] hover:text-[#1C4ED8]">
              Import Jobs
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex h-8 items-center gap-1 rounded-lg bg-[#1C4ED8] px-3 text-[11.5px] font-medium text-white shadow-[0_1px_3px_rgba(28,78,216,0.3)] transition-all hover:bg-[#1741B6]"
            >
              <span className="text-[14px] leading-none">+</span> Add Job
            </button>
          </div>
        </div>
      </div>

      {/* ════════ TABLE (EDGE-TO-EDGE) ════════ */}
      <div className="w-full">
        <DataTable
          columns={columns}
          data={jobs}
          storageKey="jobs_table"
          onRowClick={(row) => navigate(`${roleBase}/jobs/${row.id}`)}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          searchPlaceholder="Search title, client, skills…"
          emptyState={{
            title: "No job openings yet",
            hint: "Click + Add Job to create your first opening",
          }}
        />
      </div>

      {/* ════════ DELETE CONFIRM ════════ */}
      {confirmDel && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setConfirmDel(null)}
        >
          <div
            className="w-full max-w-100 rounded-2xl border border-[#E8E6E0] bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[15px] font-semibold text-[#1C1B18]">Delete job opening?</div>
            <p className="mt-1.5 text-[12.5px] leading-normal text-[#6B6860]">
              <span className="font-medium text-[#1C1B18]">
                {confirmDel.title || "This job"}
              </span>{" "}
              will be permanently removed. This action cannot be undone.
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

export default JobOpenings;