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

import useRoleBase from "../hooks/useRoleBase.js";

import { getCurrentUser } from "../utils/auth";
import { hasPermission } from "../utils/hasPermission.js";

import { PERMISSIONS } from "./settings/constants/permissions";

import PermissionGuard from "../components/PermissionGuard";

/* ──────────────────── STATUS OPTIONS ──────────────────── */

const STATUS_OPTIONS = [
  {
    value: "Available",
    color: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
  },
  {
    value: "Interviewing",
    color: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
  },
  {
    value: "On Project",
    color: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
  },
  {
    value: "Hold",
    color: "bg-[#F5F4F0] text-[#6B6860] border-[#E0DDD6]",
  },
  {
    value: "Inactive",
    color: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]",
  },
];

/* ──────────────────── COMPONENT ──────────────────── */

const Candidates = () => {
  const [showForm, setShowForm] = useState(false);

  const [candidates, setCandidates] = useState([]);

  const [confirmDel, setConfirmDel] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const roleBase = useRoleBase();

  /* ──────────────────── AUTH ──────────────────── */

  const user = getCurrentUser();

  const canView = hasPermission(
  user,
  PERMISSIONS.CANDIDATE_VIEW.module,
  PERMISSIONS.CANDIDATE_VIEW.action
);

const canCreate = hasPermission(
  user,
  PERMISSIONS.CANDIDATE_ADD.module,
  PERMISSIONS.CANDIDATE_ADD.action
);

const canEdit = hasPermission(
  user,
  PERMISSIONS.CANDIDATE_EDIT.module,
  PERMISSIONS.CANDIDATE_EDIT.action
);

const canDelete = hasPermission(
  user,
  PERMISSIONS.CANDIDATE_DELETE.module,
  PERMISSIONS.CANDIDATE_DELETE.action
);





  /* ──────────────────── ACCESS DENIED ──────────────────── */

  if (!canView) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0]">
        <div className="rounded-2xl border border-[#FECACA] bg-white px-6 py-5 text-center shadow-sm">
          <div className="text-[16px] font-semibold text-[#B91C1C]">
            Access Denied
          </div>

          <p className="mt-1 text-[13px] text-[#9B9890]">
            You do not have permission to view candidates.
          </p>
        </div>
      </div>
    );
  }

  /* ──────────────────── FETCH ──────────────────── */

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const data = await listCandidates();

      setCandidates(data || []);

    } catch (err) {

      console.error(err);

      setError("Failed to load candidates.");

    } finally {

      setLoading(false);
    }
  }, []);

  useEffect(() => {

    migrateExistingCandidates();

    refresh();

  }, [refresh]);

  /* ──────────────────── HANDLERS ──────────────────── */

  const handleAdd = async (data) => {

    try {

      await createCandidate(data);

      await refresh();

      setShowForm(false);

    } catch (err) {

      console.error(err);

      alert("Failed to create candidate.");
    }
  };

  const handleDelete = async (row) => {

    if (!canDelete) return;

    setConfirmDel(row);
  };

  const confirmDelete = async () => {

    try {

      await deleteCandidate(confirmDel.id);

      await refresh();

      setConfirmDel(null);

    } catch (err) {

      console.error(err);

      alert("Failed to delete candidate.");
    }
  };

  const handleBulkDelete = async (ids) => {

    if (!canDelete) return;

    try {

      await Promise.all(
        ids.map((id) => deleteCandidate(id))
      );

      await refresh();

    } catch (err) {

      console.error(err);

      alert("Failed to delete selected candidates.");
    }
  };

  const handleToggleBench = async (id) => {

    if (!canEdit) return;

    const previous = candidates.find(
      (c) => c.id === id
    );

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, onBench: !c.onBench }
          : c
      )
    );

    try {

      await toggleBench(id);

    } catch (err) {

      console.error(err);

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === id
            ? previous
            : c
        )
      );

      alert("Failed to update bench status.");
    }
  };

  const handleStatusChange = async (
    id,
    newStatus
  ) => {

    if (!canEdit) return;

    const previous = candidates.find(
      (c) => c.id === id
    );

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: newStatus }
          : c
      )
    );

    try {

      await updateCandidate(id, {
        status: newStatus,
      });

    } catch (err) {

      console.error(err);

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === id
            ? previous
            : c
        )
      );

      const msg =
        err.response?.data?.message ||
        "Failed to update status";

      alert(msg);
    }
  };

  /* ──────────────────── ROW CLICK ──────────────────── */

  const handleRowClick = (row) => {

    if (!canView) return;

    const path =
      `${roleBase}/candidates/${row.id}`;

    navigate(path);
  };

  /* ──────────────────── COLUMNS ──────────────────── */

  const columns = [
    {
      key: "code",
      label: "Code",
      width: 90,
      type: "text",
      bold: true,
      defaultVisible: true,
      sortable: true,
      searchable: true,
    },

    {
      key: "name",
      label: "Name",
      width: 170,
      type: "text",
      bold: true,
      link: true,
      avatar: true,
      removable: false,
      defaultVisible: true,
      sortable: true,
      searchable: true,
    },

    {
      key: "jobTitle",
      label: "Job Title",
      width: 150,
      type: "text",
      defaultVisible: true,
      sortable: true,
      searchable: true,
      filterable: true,
    },

    {
      key: "skills",
      label: "Skills",
      width: 220,
      type: "chips",
      maxChips: 2,
      defaultVisible: true,
      searchable: true,
    },

    {
      key: "experienceYears",
      label: "Exp.",
      width: 80,
      type: "experience",
      defaultVisible: true,
      sortable: true,
      sortType: "number",
    },

    {
      key: "company",
      label: "Company",
      width: 140,
      type: "text",
      defaultVisible: true,
      sortable: true,
      searchable: true,
      filterable: true,
    },

    {
      key: "city",
      label: "Location",
      width: 130,
      type: "location",
      defaultVisible: true,
      sortable: true,
      filterable: true,
    },

    {
      key: "email",
      label: "Email",
      width: 200,
      type: "text",
      defaultVisible: true,
      searchable: true,
    },

    {
      key: "phone",
      label: "Phone",
      width: 130,
      type: "text",
      defaultVisible: true,
    },

    {
      key: "onBench",
      label: "Bench",
      width: 80,
      type: "toggle",
      onToggle: handleToggleBench,
      defaultVisible: true,
      filterable: true,
    },

    {
      key: "status",
      label: "Status",
      width: 130,
      type: "status",
      statusOptions: STATUS_OPTIONS,
      onStatusChange: handleStatusChange,
      defaultVisible: true,
      sortable: true,
      filterable: true,
    },

    {
      key: "qualification",
      label: "Qualification",
      width: 140,
      type: "text",
      sortable: true,
      filterable: true,
    },

    {
      key: "linkedin",
      label: "LinkedIn",
      width: 180,
      type: "text",
    },

    {
      key: "expectedSalary",
      label: "Expected Salary",
      width: 130,
      type: "money",
      sortable: true,
      sortType: "number",
    },

    {
      key: "currentSalary",
      label: "Current Salary",
      width: 130,
      type: "money",
      sortable: true,
      sortType: "number",
    },

    {
      key: "country",
      label: "Country",
      width: 120,
      type: "text",
      sortable: true,
      filterable: true,
    },

    {
      key: "state",
      label: "State",
      width: 120,
      type: "text",
      filterable: true,
    },

    {
      key: "noticePeriod",
      label: "Notice Period",
      width: 120,
      type: "text",
      filterable: true,
    },

    {
      key: "createdAt",
      label: "Date Added",
      width: 120,
      type: "date",
      sortable: true,
      sortType: "date",
    },
  ];

  /* ──────────────────── FORM VIEW ──────────────────── */

  if (showForm) {

    return (
      <CandidateForm
        setShowForm={setShowForm}
        onSave={handleAdd}
      />
    );
  }

  /* ──────────────────── LOADING ──────────────────── */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0]">
        <div className="text-[13px] text-[#9B9890]">
          Loading candidates...
        </div>
      </div>
    );
  }

  /* ──────────────────── ERROR ──────────────────── */

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0]">
        <div className="rounded-2xl border border-[#FECACA] bg-white px-6 py-5 text-center shadow-sm">
          <div className="text-[15px] font-semibold text-[#B91C1C]">
            {error}
          </div>

          <button
            onClick={refresh}
            className="mt-4 rounded-[10px] bg-[#1C4ED8] px-4 py-2 text-[13px] font-medium text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ──────────────────── MAIN ──────────────────── */

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      <div className="w-full">
        <DataTable
          columns={columns}
          data={candidates}
          storageKey="candidates_table"
          onRowClick={handleRowClick}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          searchPlaceholder="Search name, skill, company…"
          deletePermission={PERMISSIONS.CANDIDATE_DELETE}
          bulkDeletePermission={PERMISSIONS.CANDIDATE_DELETE}
          emptyState={{
            title: "No candidates yet",
            hint: "Click + Add Candidate to get started",
          }}
          actions={
            <PermissionGuard permission={PERMISSIONS.CANDIDATE_CREATE}>
              <button
                onClick={() => setShowForm(true)}
                className="flex h-8 items-center gap-1 rounded-lg bg-[#1C4ED8] px-3 text-[11.5px] font-medium text-white shadow-sm transition-all hover:bg-[#1741B6]"
              >
                <span className="text-[14px] leading-none">+</span> Add Candidate
              </button>
            </PermissionGuard>
          }
        />

      </div>

      {/* ════════ DELETE MODAL ════════ */}

      {confirmDel && (

        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setConfirmDel(null)}
        >

          <div
            className="w-full max-w-100 rounded-2xl border border-[#E8E6E0] bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="text-[15px] font-semibold text-[#1C1B18]">
              Delete candidate?
            </div>

            <p className="mt-1.5 text-[12.5px] leading-normal text-[#6B6860]">

              <span className="font-medium text-[#1C1B18]">
                {confirmDel.name || "This candidate"}
              </span>

              {" "}will be permanently removed.
              This action cannot be undone.

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

export default Candidates;