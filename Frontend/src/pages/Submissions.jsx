import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SubmissionForm from "./SubmissionForm";
import DataTable from "../components/DataTable/DataTable";
import {
  listSubmissions,
  createSubmission,
  deleteSubmission,
} from "../api/submissionsApi";
import useRoleBase from "../hooks/useRoleBase";
import { getStatusStyle } from "../utils/submissionStatuses";

const Submissions = () => {
  const [showForm,     setShowForm]     = useState(false);
  const [submissions,  setSubmissions]  = useState([]);
  const [confirmDel,   setConfirmDel]   = useState(null);
  const navigate = useNavigate();
  const roleBase = useRoleBase();

  const refresh = useCallback(async () => {
    setSubmissions(await listSubmissions());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleAdd = async (data) => {
    await createSubmission(data);
    await refresh();
    setShowForm(false);
  };
  const handleDelete      = (row) => setConfirmDel(row);
  const confirmDelete     = async () => {
    await deleteSubmission(confirmDel.id);
    await refresh();
    setConfirmDel(null);
  };
  const handleBulkDelete  = async (ids) => {
    await Promise.all(ids.map((id) => deleteSubmission(id)));
    await refresh();
  };

  const columns = [
    {
      key: "sno", label: "S.No", width: 56, type: "sno",
      fixed: true, removable: false, defaultVisible: true, searchable: false,
    },
    {
      key: "candidateName", label: "Candidate", width: 180, type: "text",
      bold: true, link: true, avatar: true, removable: false,
      defaultVisible: true, sortable: true, searchable: true,
    },
    {
      key: "jobTitle", label: "Position", width: 180, type: "text",
      defaultVisible: true, sortable: true, searchable: true, filterable: true,
    },
    {
      key: "clientName", label: "Client", width: 150, type: "text",
      defaultVisible: true, sortable: true, searchable: true, filterable: true,
    },
    {
      key: "status", label: "Status", width: 200,
      defaultVisible: true, sortable: true, filterable: true,
      render: (row) => {
        const s = getStatusStyle(row.status);
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap"
            style={{ background: s.bg, color: s.text, borderColor: s.border || s.dot + "55" }}>
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
            {row.status || "—"}
          </span>
        );
      },
    },
    {
      key: "submittedDate", label: "Submitted", width: 120, type: "date",
      defaultVisible: true, sortable: true, sortType: "date",
    },
    {
      key: "recruiterNotes", label: "Notes", width: 200, type: "text",
      defaultVisible: false,
    },
    {
      key: "createdAt", label: "Created", width: 120, type: "date",
      sortable: true, sortType: "date", defaultVisible: false,
    },
  ];

  if (showForm) return <SubmissionForm setShowForm={setShowForm} onSave={handleAdd} />;

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">

      {/* header */}
      <div className="border-b border-[#E8E6E0] bg-white">
        <div className="flex items-center justify-between px-4 py-2.5">
          <button className="inline-flex items-center gap-2 rounded-lg border border-[#E0DDD6] bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#4A4845] hover:bg-[#F5F4F0]">
            All Submissions
            <span className="rounded-full bg-[#F1EFE8] px-1.5 py-0.5 text-[10px] text-[#4A4845]">
              {submissions.length}
            </span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex h-8 items-center gap-1 rounded-lg bg-[#1C4ED8] px-3 text-[11.5px] font-medium text-white shadow-sm hover:bg-[#1741B6] transition">
            <span className="text-[14px] leading-none">+</span> New Submission
          </button>
        </div>
      </div>

      {/* table — clicking a row opens SubmissionDetail */}
      <div className="w-full">
        <DataTable
          columns={columns}
          data={submissions}
          storageKey="submissions_table_v2"
          onRowClick={(row) => navigate(`${roleBase}/submissions/${row.id}`)}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          searchPlaceholder="Search candidate, position, client…"
          emptyState={{ title: "No submissions yet", hint: "Click + New Submission to get started" }}
        />
      </div>

      {/* delete confirm */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setConfirmDel(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-[#E8E6E0] bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <p className="text-[15px] font-semibold text-[#1C1B18]">Delete submission?</p>
            <p className="mt-1.5 text-[12.5px] text-[#6B6860]">
              Submission for{" "}
              <span className="font-medium text-[#1C1B18]">
                {confirmDel.candidateName || "this candidate"}
              </span>{" "}
              will be permanently removed.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmDel(null)}
                className="rounded-lg border border-[#E0DDD6] bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[#4A4845] hover:bg-[#F5F4F0]">
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="rounded-lg bg-[#DC2626] px-3.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-[#B91C1C]">
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