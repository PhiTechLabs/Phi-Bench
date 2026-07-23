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
import ErrorModal from "../components/shared/ErrorModal";
import { parseApiError } from "../utils/apiError";



/* ──────────────────── STATUS PIPELINE ──────────────────── */
const STATUS_OPTIONS = [
  { value: "Open",    color: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]" },
  { value: "On Hold", color: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]" },
  { value: "Filled",  color: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]" },
  { value: "Closed",  color: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]" },
];

/* ──────────────────── COMPONENT ──────────────────── */

const JobOpenings = () => {
  const [showForm, setShowForm]     = useState(false);
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [confirmDel, setConfirmDel] = useState(null);
  const [formError, setFormError]   = useState(null);
  const navigate = useNavigate();
  const roleBase = useRoleBase();

  const user = getCurrentUser();
  const canCreate = hasPermission(user, PERMISSIONS.JOB_ADD);
  const canEdit = hasPermission(user, PERMISSIONS.JOB_EDIT);
  const canDelete = hasPermission(user, PERMISSIONS.JOB_DELETE);

  const refresh = useCallback(async () => {
    try {
      setJobs(await listJobs());
    } catch (err) {
      console.warn("Failed to load jobs:", err?.response?.data || err);
      alert(getApiErrorMessage(err));
    } finally {
      setLoading(false);
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
      throw err; // rethrow so JobForm's own catch can show the error modal
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
      setFormError(parseApiError(err, "Failed to delete job"));
    }
  };
  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteJob(id)));
      await refresh();
    } catch (err) {
      console.warn("Bulk delete failed:", err?.response?.data || err);
      setFormError(parseApiError(err, "Failed to delete selected jobs"));
    }
  };
  const handleStatusChange = async (id, newStatus) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j)));
    try {
      await updateJob(id, { status: newStatus });
    } catch (err) {
      console.warn("Status update failed:", err?.response?.data || err);
      setFormError(parseApiError(err, "Failed to update job status"));
      await refresh();
    }
  };

  /* ── column registry ── */
  const columns = [
    { key: "code",       label: "Code",          width: 90,  type: "text",     bold: true, defaultVisible: true, sortable: true, searchable: true },
    { key: "title",      label: "Position",      width: 200, type: "text",     bold: true, link: true, avatar: true, removable: false, defaultVisible: true, sortable: true, searchable: true },
    { key: "client",     label: "Client",        width: 160, type: "text",     defaultVisible: true, sortable: true, searchable: true, filterable: true },
    { key: "skills",     label: "Skills",        width: 220, type: "chips",    maxChips: 2, defaultVisible: true, searchable: true },
    { key: "experience", label: "Exp.",          width: 90,  type: "text",     defaultVisible: true, sortable: true, searchable: true },
    { key: "jobType",    label: "Type",          width: 120, type: "text",     defaultVisible: true, sortable: true, filterable: true },
    { key: "city",       label: "Location",      width: 140, type: "location", defaultVisible: true, sortable: true, filterable: true },
    { key: "salary",     label: "Salary / Rate", width: 140, type: "text",     defaultVisible: true, searchable: true },
    { key: "billRate",   label: "Bill Rate",     width: 120, type: "text",     searchable: true },
    { key: "payRate",    label: "Pay Rate",      width: 120, type: "text",     searchable: true },
    {
      key: "status", label: "Status", width: 120, type: "status",
      statusOptions: STATUS_OPTIONS, onStatusChange: handleStatusChange,
      defaultVisible: true, sortable: true, filterable: true,
    },
    { key: "contact",    label: "Contact",       width: 150, type: "text", searchable: true },
    { key: "contactPhone", label: "Contact No.", width: 130, type: "text", searchable: true },
    { key: "manager",    label: "Account Mgr.",  width: 150, type: "text", searchable: true, filterable: true },
    { key: "recruiter",  label: "Recruiter",     width: 150, type: "text", searchable: true, filterable: true },
    { key: "industry",   label: "Industry",      width: 140, type: "text", sortable: true, filterable: true },
    { key: "country",    label: "Country",       width: 120, type: "text", sortable: true, filterable: true },
    { key: "dateOpened", label: "Date Opened",   width: 120, type: "date", sortable: true, sortType: "date" },
    { key: "targetDate", label: "Target Date",   width: 120, type: "date", sortable: true, sortType: "date" },
    { key: "createdAt",  label: "Created On",   width: 120, type: "date", sortable: true, sortType: "date",   defaultVisible: false },
    { key: "createdBy",  label: "Created By",   width: 130, type: "text", sortable: true, sortType: "string", searchable: true, filterable: true, defaultVisible: false },
    { key: "updatedAt",  label: "Updated On",   width: 120, type: "date", sortable: true, sortType: "date",   defaultVisible: false },
    { key: "updatedBy",  label: "Updated By",   width: 130, type: "text", sortable: true, sortType: "string", searchable: true, filterable: true, defaultVisible: false },
  ];

  if (showForm) {
    return <JobForm setShowForm={setShowForm} onSave={handleAdd} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      <div className="w-full">
        <DataTable
          columns={columns}
          data={jobs}
          storageKey="jobs_table"
          getRowHref={(row) => `${roleBase}/jobs/${row.id}`}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          searchPlaceholder="Search title, client, skills…"
          loading={loading}
          loadingLabel="Loading jobs…"
          emptyState={{
            title: "No job openings yet",
            hint: "Click + Add Job to create your first opening",
          }}
          actions={
            <button
              onClick={() => setShowForm(true)}
              className="flex h-8 items-center gap-1 rounded-lg bg-[#1C4ED8] px-3 text-[11.5px] font-medium text-white shadow-sm transition-all hover:bg-[#1741B6]"
            >
              <span className="text-[14px] leading-none">+</span> Add Job
            </button>
          }
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

      {formError && (
        <ErrorModal
          title={formError.title}
          message={formError.message}
          errors={formError.errors}
          onClose={() => setFormError(null)}
        />
      )}
    </div>
  );
};

export default JobOpenings;