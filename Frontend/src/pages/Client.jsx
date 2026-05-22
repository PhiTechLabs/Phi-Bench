import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable/DataTable";
import { getAllClients, deleteClient, updateClient } from "../api/clientApi";
import useRoleBase from "../hooks/useRoleBase";
import { getCurrentUser } from "../utils/auth";
import { hasPermission } from "../utils/hasPermission";
import { PERMISSIONS } from "../pages/settings/constants/permissions";

/* ──────────────────── STATUS PIPELINE ──────────────────── */
const STATUS_OPTIONS = [
  { value: "Active",     color: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]" },
  { value: "Prospect",   color: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]" },
  { value: "Onboarding", color: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]" },
  { value: "On Hold",    color: "bg-[#F5F4F0] text-[#6B6860] border-[#E0DDD6]" },
  { value: "Inactive",   color: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]" },
];

/* Maps backend `_id` → `id` and flattens nested locations/pocs for table display */
const shapeClient = (c) => {
  const loc = c.locations?.[0];
  const poc = c.pocs?.[0];
  return {
    ...c,
    id:           c._id || c.id,
    primaryPoc:   poc?.name || "",
    primaryEmail: poc?.email || "",
    primaryPhone: poc?.contact || c.contactNumber || "",
    primaryCity:  loc?.city || c.billingCity || "",
    primaryState: loc?.state || c.billingState || "",
  };
};

/* ──────────────────── COMPONENT ──────────────────── */

const Client = () => {
  const [clients, setClients]       = useState([]);
  const [confirmDel, setConfirmDel] = useState(null);
  const navigate = useNavigate();
  
  const roleBase = useRoleBase();

  const user = getCurrentUser();
  const canView = hasPermission(user, PERMISSIONS.CLIENT_VIEW);
  const canEdit = hasPermission(user, PERMISSIONS.CLIENT_EDIT);
  const canDelete = hasPermission(user, PERMISSIONS.CLIENT_DELETE);

  if (!canView) {
    return <div className="p-10 text-red-500">Access Denied</div>;
  }

  const refresh = useCallback(async () => {
    const data = await getAllClients();
    const list = Array.isArray(data) ? data : (data?.data || data?.clients || []);
    setClients(list.map(shapeClient));
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  /* ── handlers ── */
  const handleDelete = (row) => {
    if (!canDelete) return;
    setConfirmDel(row);
  };
  const confirmDelete = async () => {
    await deleteClient(confirmDel.id);
    await refresh();
    setConfirmDel(null);
  };
  const handleBulkDelete = async (ids) => {
    await Promise.all(ids.map((id) => deleteClient(id)));
    await refresh();
  };
  const handleStatusChange = async (id, newStatus) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    await updateClient(id, { status: newStatus });
  };

  /* ── columns ── */
  const columns = [
    { key: "sno",            label: "S.No",            width: 56,  type: "sno", fixed: true, removable: false, defaultVisible: true, searchable: false },
    { key: "clientName",     label: "Client",          width: 200, type: "text", bold: true, link: true, avatar: true, removable: false, defaultVisible: true, sortable: true, searchable: true },
    { key: "industry",       label: "Industry",        width: 140, type: "text", defaultVisible: true, sortable: true, filterable: true, searchable: true },
    { key: "primaryCity",    label: "Location",        width: 130, type: "text", defaultVisible: true, sortable: true, filterable: true },
    { key: "accountManager", label: "Account Manager", width: 160, type: "text", defaultVisible: true, sortable: true, filterable: true, searchable: true },
    { key: "primaryPhone",   label: "Contact",         width: 140, type: "text", defaultVisible: true, searchable: true },
    { key: "primaryPoc",     label: "POC Name",        width: 150, type: "text", defaultVisible: true, searchable: true },
    { key: "primaryEmail",   label: "Email",           width: 200, type: "text", defaultVisible: true, searchable: true },
    {
      key: "status", label: "Status", width: 130, type: "status",
      statusOptions: STATUS_OPTIONS, onStatusChange: handleStatusChange,
      defaultVisible: true, sortable: true, filterable: true,
    },
    { key: "createdAt",    label: "Created",      width: 110, type: "date", defaultVisible: true, sortable: true, sortType: "date" },
    /* ─── Hidden by default ─── */
    { key: "website",      label: "Website",      width: 180, type: "text" },
    { key: "primaryState", label: "State",        width: 120, type: "text", filterable: true },
    { key: "country",      label: "Country",      width: 120, type: "text", filterable: true, sortable: true },
    { key: "gstNumber",    label: "GST Number",   width: 150, type: "text" },
    { key: "panNumber",    label: "PAN Number",   width: 130, type: "text" },
    { key: "updatedAt",    label: "Last Updated", width: 120, type: "date", sortable: true, sortType: "date" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      {/* ════════ COMPACT HEADER BAR ════════ */}
      <div className="border-b border-[#E8E6E0] bg-white">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center gap-2 rounded-lg border border-[#E0DDD6] bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#4A4845] hover:bg-[#F5F4F0]">
              My Clients 
              <span className="rounded-full bg-[#F1EFE8] px-1.5 py-0.5 text-[10px] text-[#4A4845]">
                {clients.length}
              </span>
            </button>
            {/* <button className="text-[11px] text-[#1C4ED8] hover:underline">+ 3 more...</button> */}
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[11px] font-medium text-[#6B6860] hover:text-[#1C4ED8]">
              Customize table
            </button>
            <button className="text-[11px] font-medium text-[#6B6860] hover:text-[#1C4ED8]">
              Import Clients
            </button>
            <button
              onClick={() => navigate(`${roleBase}/add-client`)}
              className="flex h-8 items-center gap-1 rounded-lg bg-[#1C4ED8] px-3 text-[11.5px] font-medium text-white shadow-[0_1px_3px_rgba(28,78,216,0.3)] transition-all hover:bg-[#1741B6]"
            >
              <span className="text-[14px] leading-none">+</span> Add Client
            </button>
          </div>
        </div>
      </div>

      {/* ════════ TABLE (EDGE-TO-EDGE) ════════ */}
      <div className="w-full">
        <DataTable
          columns={columns}
          data={clients}
          storageKey="clients_table"
          onRowClick={(row) => navigate(`${roleBase}/client-list/${row.id}`)}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          searchPlaceholder="Search company, contact, manager…"
          emptyState={{
            title: "No clients yet",
            hint: "Click + Add Client to get started",
          }}
        />
      </div>

      {/* ════════ DELETE CONFIRM ════════ */}
      {confirmDel && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm" onClick={() => setConfirmDel(null)}>
          <div className="w-full max-w-100 rounded-2xl border border-[#E8E6E0] bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-[15px] font-semibold text-[#1C1B18]">Delete client?</div>
            <p className="mt-1.5 text-[12.5px] leading-normal text-[#6B6860]">
              <span className="font-medium text-[#1C1B18]">{confirmDel.clientName || "This client"}</span> will be permanently removed. This action cannot be undone.
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

export default Client;