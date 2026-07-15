import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable/DataTable";
import {
  listSubmissions,
  updateSubmission,
  deleteSubmission,
} from "../api/submissionsApi";
import useRoleBase from "../hooks/useRoleBase";
import {
  getStatusStyle,
  getAllowedTransitions,
} from "../utils/submissionStatuses";

// ─── INLINE STATUS CHANGER ───────────────────────────────────────────────────
// Renders the status badge. On click opens a fixed popover with allowed next
// statuses. Picking one calls updateSubmission and refreshes the table.
// e.stopPropagation() prevents the row click from navigating away.
const StatusChanger = ({ row, onStatusChanged }) => {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [pos,     setPos]     = useState({ x: 0, y: 0 });
  const popoverRef = useRef();
  const badgeRef   = useRef(); // ref to the badge element for scroll tracking

  const s       = getStatusStyle(row.status);
  const allowed = getAllowedTransitions(row.status);

  // Recompute position from the badge's current rect
  const updatePos = useCallback(() => {
    if (!badgeRef.current) return;
    const rect = badgeRef.current.getBoundingClientRect();
    setPos({ x: rect.left, y: rect.bottom + 6 });
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // Reposition on scroll / resize while open
  useEffect(() => {
    if (!open) return;
    const onScroll = () => updatePos();
    window.addEventListener("scroll", onScroll, true); // capture: true catches all scroll containers
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, updatePos]);

  const handleBadgeClick = (e) => {
    e.stopPropagation();
    if (allowed.length === 0) return;
    updatePos();
    setOpen((o) => !o);
  };

  const handlePickStatus = async (e, newStatus) => {
    e.stopPropagation();
    setLoading(true);
    setOpen(false);
    try {
      await updateSubmission(row.id, { status: newStatus });
      await onStatusChanged();
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Status badge */}
      <span
        ref={badgeRef}
        onClick={handleBadgeClick}
        title={allowed.length > 0 ? "Click to change status" : "Terminal status"}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-all ${
          allowed.length > 0
            ? "cursor-pointer hover:opacity-80 hover:shadow-sm"
            : "cursor-default"
        } ${loading ? "opacity-50" : ""}`}
        style={{ background: s.bg, color: s.text, borderColor: s.border || s.dot + "55" }}
      >
        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
        {row.status || "—"}
        {allowed.length > 0 && (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-60">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </span>

      {/* Fixed popover — tracks badge position on scroll */}
      {open && allowed.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-[70]"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          />
          <div
            ref={popoverRef}
            className="fixed z-[71] w-52 rounded-xl border border-[#E8E6E0] bg-white py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.14)]"
            style={{ left: pos.x, top: pos.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="px-3 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#9B9890]">
              Move to
            </p>
            {allowed.map((nextStatus) => {
              const ns = getStatusStyle(nextStatus);
              return (
                <button
                  key={nextStatus}
                  onClick={(e) => handlePickStatus(e, nextStatus)}
                  className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[12.5px] transition hover:bg-[#F5F4F0]"
                >
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: ns.dot }} />
                  <span className="text-[#1C1B18]">{nextStatus}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

// ─── SUBMISSIONS PAGE ─────────────────────────────────────────────────────────
const Submissions = () => {
  const [submissions,  setSubmissions]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [confirmDel,   setConfirmDel]   = useState(null);
  const navigate = useNavigate();
  const roleBase = useRoleBase();

  const refresh = useCallback(async () => {
    try {
      setSubmissions(await listSubmissions());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDelete     = (row) => setConfirmDel(row);
  const confirmDelete    = async () => {
    await deleteSubmission(confirmDel.id);
    await refresh();
    setConfirmDel(null);
  };
  const handleBulkDelete = async (ids) => {
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
      key: "status", label: "Status", width: 220,
      defaultVisible: true, sortable: true, filterable: true,
      render: (row) => (
        <StatusChanger row={row} onStatusChanged={refresh} />
      ),
    },
    {
      key: "submittedDate", label: "Submitted On", width: 120, type: "date",
      defaultVisible: true, sortable: true, sortType: "date",
    },
    {
      key: "recruiterNotes", label: "Notes", width: 200, type: "text",
      defaultVisible: false,
    },
    {
      key: "createdAt", label: "Created On", width: 120, type: "date",
      sortable: true, sortType: "date", defaultVisible: false,
    },
    {
      key: "submittedBy", label: "Submitted By", width: 130, type: "text",
      sortable: true, sortType: "string", searchable: true, filterable: true,
      defaultVisible: true,
    },
    {
      key: "createdBy", label: "Created By", width: 130, type: "text",
      sortable: true, sortType: "string", searchable: true, filterable: true,
      defaultVisible: false,
    },
    {
      key: "updatedAt", label: "Updated On", width: 120, type: "date",
      sortable: true, sortType: "date", defaultVisible: false,
    },
    {
      key: "updatedBy", label: "Updated By", width: 130, type: "text",
      sortable: true, sortType: "string", searchable: true, filterable: true,
      defaultVisible: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      <div className="w-full">
        <DataTable
          columns={columns}
          data={submissions}
          storageKey="submissions_table_v2"
          getRowHref={(row) => `${roleBase}/submissions/${row.id}`}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          searchPlaceholder="Search candidate, position, client…"
          loading={loading}
          loadingLabel="Loading submissions…"
          emptyState={{ title: "No submissions yet", hint: "Submit a candidate from a Job or Candidate detail page to get started" }}
        />
      </div>

      {/* delete confirm */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setConfirmDel(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-[#E8E6E0] bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <p className="text-[15px] font-semibold text-[#1C1B18]">Delete submission?</p>
            <p className="mt-1 text-[13px] text-[#6B6860]">
              This will permanently remove the submission for{" "}
              <strong>{confirmDel.candidateName}</strong> from{" "}
              <strong>{confirmDel.jobTitle}</strong>.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmDel(null)}
                className="rounded-lg border border-[#E8E6E0] px-4 py-2 text-[13px] text-[#4A4845] hover:bg-[#F5F4F0] transition">
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="rounded-lg bg-[#DC2626] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#B91C1C] transition">
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