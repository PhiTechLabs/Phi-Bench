import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getClientById,
    deleteClient,
    updateClient,
    getClientDocumentUrl,
} from "../api/clientApi";
import { listJobs } from "../api/jobsApi";
import { getAvatarProps } from "../utils/avatar";
import useRoleBase from "../hooks/useRoleBase";


// ─── ICON ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        strokeLinejoin="round" className={className}>
        <path d={d} />
    </svg>
);

const icons = {
    back:      "M19 12H5M12 19l-7-7 7-7",
    edit:      "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    trash:     "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    building:  "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    globe:     "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z M2 12h20 M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
    phone:     "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z",
    mail:      "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
    user:      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    people:    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    pin:       "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10m-3 0a3 3 0 106 0 3 3 0 10-6 0",
    linkedin:  "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z M2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z",
    brief:     "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    doc:       "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    calendar:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    chevron:   "M9 5l7 7-7 7",
    check:     "M5 13l4 4L19 7",
    source:    "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    external:  "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6 M15 3h6v6 M10 14L21 3",
};

// ─── STATUS CONFIGS ───────────────────────────────────────────────────────────
const CLIENT_STATUS = {
    Active:     { bg: "#ECFDF5", text: "#065F46", dot: "#10B981", border: "#A7F3D0" },
    Prospect:   { bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B", border: "#FDE68A" },
    Onboarding: { bg: "#EFF6FF", text: "#1E40AF", dot: "#3B82F6", border: "#BFDBFE" },
    "On Hold":  { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316", border: "#FED7AA" },
    Inactive:   { bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF", border: "#E5E7EB" },
};

const JOB_STATUS = {
    Open:      { bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
    Closed:    { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
    "On Hold": { bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B" },
    Filled:    { bg: "#EFF6FF", text: "#1E40AF", dot: "#3B82F6" },
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
const Badge = ({ label, map }) => {
    const cfg = (map && map[label]) || { bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF" };
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
            style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.dot + "55" }}>
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
            {label || "—"}
        </span>
    );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const ClientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const roleBase = useRoleBase();

    const [client, setClient]       = useState(null);
    const [jobs, setJobs]           = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const [statusLoading, setStatusLoading] = useState(false);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                const res = await getClientById(id);
                // backend returns { client: {...} }
                const clientData = res?.client || res;

                if (active) {
                    setClient(clientData);
                    // Fetch all jobs and filter by this client's name
                    const allJobs = await listJobs().catch(() => []);
                    const clientJobs = allJobs.filter(
                        (j) => j.client?.toLowerCase().trim() === clientData?.clientName?.toLowerCase().trim()
                    );
                    setJobs(clientJobs);
                }
            } catch (err) {
                console.error(err);
                if (active) setError("Failed to load client details.");
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("Delete this client? This cannot be undone.")) return;
        try {
            await deleteClient(id);
            navigate(`${roleBase}/client-list`);
        } catch (e) {
            alert("Failed to delete client.");
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (statusLoading) return;
        setStatusLoading(true);
        try {
            const res = await updateClient(id, { status: newStatus });
            setClient(res?.client || res);
        } catch (e) {
            alert("Failed to update status.");
        } finally {
            setStatusLoading(false);
        }
    };

    // ── Loading ──
    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9]">
            <div className="flex flex-col items-center gap-3">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2563EB]" />
                <span className="text-[13px] text-[#94A3B8]">Loading client…</span>
            </div>
        </div>
    );

    // ── Error ──
    if (error) return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9] p-4">
            <div className="rounded-xl border border-red-200 bg-white px-8 py-6 text-center shadow-sm">
                <p className="text-[15px] font-semibold text-red-600 mb-3">{error}</p>
                <button onClick={() => navigate(`${roleBase}/client-list`)}
                    className="rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8]">
                    Back to Clients
                </button>
            </div>
        </div>
    );

    // ── Not Found ──
    if (!client) return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9] p-4">
            <div className="rounded-xl border border-[#E2E8F0] bg-white px-8 py-6 text-center shadow-sm">
                <p className="text-[15px] font-semibold text-[#1E293B] mb-1">Client not found</p>
                <p className="text-[13px] text-[#94A3B8] mb-4">This client doesn't exist or was deleted.</p>
                <button onClick={() => navigate(`${roleBase}/client-list`)}
                    className="rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8]">
                    Back to Clients
                </button>
            </div>
        </div>
    );

    const { initials, bgColor, textColor } = getAvatarProps(client.clientName);

    const openJobs   = jobs.filter((j) => j.status === "Open").length;
    const filledJobs = jobs.filter((j) => j.status === "Filled").length;

    const tabs = [
        { id: "overview",   label: "Overview"  },
        { id: "jobs",       label: "Jobs",       count: jobs.length  },
        { id: "locations",  label: "Locations",  count: client.locations?.length || 0 },
        { id: "contacts",   label: "Contacts",   count: client.pocs?.length || 0 },
        { id: "documents",  label: "Documents",  count: client.documents?.length || 0 },
    ];

    return (
        <div className="min-h-screen bg-[#F4F6F9]">

            {/* ═══ STICKY HEADER ═══ */}
            <div className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] shadow-sm">

                {/* Row 1: back + identity + actions */}
                <div className="flex items-center gap-4 px-6 py-3 border-b border-[#F1F5F9]">

                    {/* Back */}
                    <button onClick={() => navigate(`${roleBase}/client-list`)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC] transition shrink-0">
                        <Icon d={icons.back} size={15} />
                    </button>

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold shadow-sm"
                            style={{ backgroundColor: bgColor, color: textColor }}>
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-[17px] font-bold text-[#1E293B] truncate">
                                    {client.clientName}
                                </h1>
                                {client.code && (
                                    <span className="rounded-md bg-[#EFF6FF] px-2.5 py-1 text-[13px] font-bold text-[#2563EB]">
                                        {client.code}
                                    </span>
                                )}
                                <Badge label={client.status} map={CLIENT_STATUS} />
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-[12px] text-[#64748B]">
                                {client.industry && <span>{client.industry}</span>}
                                {client.industry && client.website && (
                                    <span className="text-[#CBD5E1]">·</span>
                                )}
                                {client.website && (
                                    <a href={client.website} target="_blank" rel="noopener noreferrer"
                                        className="text-[#2563EB] hover:underline truncate max-w-50">
                                        {client.website.replace(/^https?:\/\//, "")}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => navigate(`${roleBase}/client-list/edit/${id}`)}
                            className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                            <Icon d={icons.edit} size={13} /> Edit
                        </button>
                        <button onClick={handleDelete}
                            className="flex items-center gap-1.5 rounded-lg border border-[#FECACA] bg-white px-3 py-1.5 text-[12px] font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition">
                            <Icon d={icons.trash} size={13} /> Delete
                        </button>
                    </div>
                </div>

                {/* Row 2: Tabs */}
                <div className="flex items-center gap-0 px-6">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 text-[13px] font-medium border-b-2 transition ${
                                activeTab === tab.id
                                    ? "border-[#2563EB] text-[#2563EB]"
                                    : "border-transparent text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC]"
                            }`}>
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    activeTab === tab.id
                                        ? "bg-[#DBEAFE] text-[#1D4ED8]"
                                        : "bg-[#F1F5F9] text-[#64748B]"
                                }`}>{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══ BODY ═══ */}
            <div className="flex">

                {/* ── Main Content ── */}
                <div className="flex-1 min-w-0 p-6 space-y-5 overflow-auto">

                    {/* ── OVERVIEW TAB ── */}
                    {activeTab === "overview" && (
                        <>
                            {/* Summary Grid */}
                            <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
                                <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3">
                                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
                                        Summary
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#F1F5F9]">
                                    <SummaryCell label="Industry"       value={client.industry} />
                                    <SummaryCell label="Account Manager" value={client.accountManager} />
                                    <SummaryCell label="Source"         value={client.source} />
                                    <SummaryCell label="Parent Client"  value={client.parentClient} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#F1F5F9] border-t border-[#F1F5F9]">
                                    <SummaryCell label="Open Jobs"   value={String(openJobs)} />
                                    <SummaryCell label="Filled Jobs" value={String(filledJobs)} />
                                    <SummaryCell label="Locations"   value={String(client.locations?.length || 0)} />
                                    <SummaryCell label="Contacts"    value={String(client.pocs?.length || 0)} />
                                </div>
                            </div>

                            {/* Company Information */}
                            <CeipalCard title="Company Information">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <KVField icon={icons.building} label="Client Name"     value={client.clientName} />
                                    <KVField icon={icons.building} label="Parent Client"   value={client.parentClient} />
                                    <KVField icon={icons.phone}    label="Contact Number"  value={client.contactNumber} />
                                    <KVField icon={icons.globe}    label="Website"         value={client.website}
                                        link={client.website} />
                                    <KVField icon={icons.brief}    label="Industry"        value={client.industry} />
                                    <KVField icon={icons.source}   label="Source"          value={client.source} />
                                    <KVField icon={icons.user}     label="Account Manager" value={client.accountManager} />
                                    {client.linkedin && (
                                        <KVField icon={icons.linkedin} label="LinkedIn"
                                            value="View LinkedIn"
                                            link={client.linkedin} />
                                    )}
                                </div>
                            </CeipalCard>

                            {/* About */}
                            {client.about && (
                                <CeipalCard title="About">
                                    <p className="text-[13px] leading-7 text-[#475569] whitespace-pre-wrap">
                                        {client.about}
                                    </p>
                                </CeipalCard>
                            )}

                            {/* Primary Contact (first POC) quick view */}
                            {client.pocs && client.pocs.length > 0 && (
                                <CeipalCard title="Primary Contact">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-full bg-linear-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center text-white text-[14px] font-bold shrink-0">
                                            {(client.pocs[0].firstName?.[0] || "") + (client.pocs[0].lastName?.[0] || "")}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                                            <KVField icon={icons.user}  label="Name"
                                                value={`${client.pocs[0].firstName} ${client.pocs[0].lastName}`} />
                                            <KVField icon={icons.brief} label="Designation"
                                                value={client.pocs[0].designation} />
                                            <KVField icon={icons.mail}  label="Email"
                                                value={client.pocs[0].email}
                                                link={`mailto:${client.pocs[0].email}`} />
                                            <KVField icon={icons.phone} label="Phone"
                                                value={client.pocs[0].contact}
                                                link={`tel:${client.pocs[0].contact}`} />
                                            <KVField icon={icons.pin}   label="Location"
                                                value={client.pocs[0].location} />
                                            {client.pocs.length > 1 && (
                                                <div className="flex items-end">
                                                    <button onClick={() => setActiveTab("contacts")}
                                                        className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
                                                        +{client.pocs.length - 1} more contacts →
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CeipalCard>
                            )}

                            {/* Primary Location quick view */}
                            {client.locations && client.locations.length > 0 && (
                                <CeipalCard title="Primary Location">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <KVField icon={icons.pin} label="Street"   value={client.locations[0].street} />
                                        <KVField icon={icons.pin} label="City"     value={client.locations[0].city} />
                                        <KVField icon={icons.pin} label="Province" value={client.locations[0].province} />
                                        <KVField icon={icons.pin} label="Code"     value={client.locations[0].code} />
                                        <KVField icon={icons.pin} label="Country"  value={client.locations[0].country} />
                                        {client.locations.length > 1 && (
                                            <div className="flex items-end">
                                                <button onClick={() => setActiveTab("locations")}
                                                    className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
                                                    +{client.locations.length - 1} more locations →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </CeipalCard>
                            )}
                        </>
                    )}

                    {/* ── JOBS TAB ── */}
                    {activeTab === "jobs" && (
                        <JobsTab jobs={jobs} roleBase={roleBase} navigate={navigate} />
                    )}

                    {/* ── LOCATIONS TAB ── */}
                    {activeTab === "locations" && (
                        <LocationsTab locations={client.locations || []} />
                    )}

                    {/* ── CONTACTS TAB ── */}
                    {activeTab === "contacts" && (
                        <ContactsTab pocs={client.pocs || []} />
                    )}

                    {/* ── DOCUMENTS TAB ── */}
                    {activeTab === "documents" && (
                        <DocumentsTab
                            documents={client.documents || []}
                            clientId={client._id}
                        />
                    )}
                </div>

                {/* ── Right Sidebar ── */}
                <div className="w-60 shrink-0 border-l border-[#E2E8F0] bg-white flex flex-col">

                    {/* Client Status */}
                    <div className="border-b border-[#F1F5F9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">
                            Client Status
                        </p>
                        <div className="mb-2">
                            <Badge label={client.status} map={CLIENT_STATUS} />
                        </div>
                        <select
                            value={client.status || "Active"}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={statusLoading}
                            className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[12px] font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50">
                            {["Active", "Prospect", "Onboarding", "On Hold", "Inactive"].map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Quick Actions */}
                    <div className="border-b border-[#F1F5F9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">
                            Quick Actions
                        </p>
                        <div className="space-y-2">
                            <SidebarAction
                                icon={icons.brief}
                                label="View Jobs"
                                count={jobs.length}
                                onClick={() => setActiveTab("jobs")}
                            />
                            <SidebarAction
                                icon={icons.people}
                                label="View Contacts"
                                count={client.pocs?.length || 0}
                                onClick={() => setActiveTab("contacts")}
                            />
                            <SidebarAction
                                icon={icons.pin}
                                label="View Locations"
                                count={client.locations?.length || 0}
                                onClick={() => setActiveTab("locations")}
                            />
                            <SidebarAction
                                icon={icons.doc}
                                label="View Documents"
                                count={client.documents?.length || 0}
                                onClick={() => setActiveTab("documents")}
                            />
                        </div>
                    </div>

                    {/* Job Stats */}
                    <div className="border-b border-[#F1F5F9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">
                            Job Stats
                        </p>
                        <div className="space-y-2.5">
                            <SidebarKV label="Total Jobs" value={String(jobs.length)} />
                            <SidebarKV label="Open"       value={String(openJobs)} />
                            <SidebarKV label="Filled"     value={String(filledJobs)} />
                            <SidebarKV label="Closed"     value={String(jobs.filter((j) => j.status === "Closed").length)} />
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="p-4 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">
                            Quick Info
                        </p>
                        <div className="space-y-2.5">
                            <SidebarKV label="Industry"   value={client.industry} />
                            <SidebarKV label="Account Mgr" value={client.accountManager} />
                            <SidebarKV label="Contact"    value={client.contactNumber} />
                            <SidebarKV label="Source"     value={client.source} />
                            {client.createdAt && (
                                <SidebarKV label="Client Since" value={fmtDate(client.createdAt)} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── JOBS TAB ─────────────────────────────────────────────────────────────────
const JobsTab = ({ jobs, roleBase, navigate }) => {
    const [filter, setFilter] = useState("All");
    const filters = ["All", "Open", "Filled", "On Hold", "Closed"];

    const filtered = filter === "All" ? jobs : jobs.filter((j) => j.status === filter);

    if (!jobs.length) return (
        <EmptyState icon={icons.brief} title="No jobs found"
            message="No jobs have been created for this client yet." />
    );

    return (
        <div className="space-y-4">
            {/* Filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
                {filters.map((f) => {
                    const count = f === "All" ? jobs.length : jobs.filter((j) => j.status === f).length;
                    return (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium border transition ${
                                filter === f
                                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                                    : "bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                            }`}>
                            {f}
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                filter === f ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-[#64748B]"
                            }`}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Job cards */}
            {filtered.length === 0 ? (
                <div className="rounded-xl bg-white border border-[#E2E8F0] p-8 text-center">
                    <p className="text-[13px] text-[#94A3B8]">No {filter} jobs found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((job) => (
                        <div key={job.id || job._id}
                            className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-5 hover:shadow-md transition cursor-pointer"
                            onClick={() => navigate(`${roleBase}/jobs/${job.id || job._id}`)}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-[14px] font-semibold text-[#1E293B] truncate">
                                            {job.title}
                                        </p>
                                        <Badge label={job.status} map={JOB_STATUS} />
                                    </div>
                                    <div className="flex items-center gap-4 mt-1.5 text-[12px] text-[#64748B]">
                                        {job.jobType && <span>{job.jobType}</span>}
                                        {job.experience && <span>{job.experience}</span>}
                                        {job.city && (
                                            <span className="flex items-center gap-1">
                                                <Icon d={icons.pin} size={11} />
                                                {job.city}{job.country ? `, ${job.country}` : ""}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1.5 text-[11px] text-[#94A3B8]">
                                        {job.recruiter && <span>Recruiter: {job.recruiter}</span>}
                                        {job.dateOpened && (
                                            <span className="flex items-center gap-1">
                                                <Icon d={icons.calendar} size={11} />
                                                Opened {fmtDate(job.dateOpened)}
                                            </span>
                                        )}
                                        {job.targetDate && (
                                            <span className="flex items-center gap-1">
                                                <Icon d={icons.calendar} size={11} />
                                                Target {fmtDate(job.targetDate)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {job.salary && (
                                    <div className="shrink-0 text-right">
                                        <p className="text-[11px] text-[#94A3B8]">Salary</p>
                                        <p className="text-[13px] font-semibold text-[#1E293B]">{job.salary}</p>
                                    </div>
                                )}
                            </div>
                            {/* Skills */}
                            {job.skills && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {job.skills.split(",").filter(Boolean).slice(0, 5).map((s, i) => (
                                        <span key={i}
                                            className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#475569]">
                                            {s.trim()}
                                        </span>
                                    ))}
                                    {job.skills.split(",").filter(Boolean).length > 5 && (
                                        <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#94A3B8]">
                                            +{job.skills.split(",").filter(Boolean).length - 5}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── LOCATIONS TAB ────────────────────────────────────────────────────────────
const LocationsTab = ({ locations }) => {
    if (!locations.length) return (
        <EmptyState icon={icons.pin} title="No locations"
            message="No office locations have been added for this client." />
    );

    return (
        <div className="space-y-4">
            {locations.map((loc, index) => (
                <div key={loc._id || index}
                    className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
                    <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
                            Location {index + 1}
                        </span>
                        {loc.city && loc.country && (
                            <span className="text-[12px] font-semibold text-[#1E293B]">
                                {loc.city}, {loc.country}
                            </span>
                        )}
                    </div>
                    <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-5">
                        <KVField icon={icons.pin} label="Street"         value={loc.street} />
                        <KVField icon={icons.pin} label="City"           value={loc.city} />
                        <KVField icon={icons.pin} label="Province/State" value={loc.province} />
                        <KVField icon={icons.pin} label="Postal Code"    value={loc.code} />
                        <KVField icon={icons.pin} label="Country"        value={loc.country} />
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── CONTACTS TAB ─────────────────────────────────────────────────────────────
const ContactsTab = ({ pocs }) => {
    if (!pocs.length) return (
        <EmptyState icon={icons.people} title="No contacts"
            message="No points of contact have been added for this client." />
    );

    return (
        <div className="space-y-4">
            {pocs.map((poc, index) => (
                <div key={poc._id || index}
                    className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
                    <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3">
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
                            Contact {index + 1}
                        </span>
                    </div>
                    <div className="p-5">
                        <div className="flex items-start gap-4 mb-5">
                            {/* Avatar */}
                            <div className="h-12 w-12 rounded-full bg-linear-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center text-white text-[14px] font-bold shrink-0">
                                {(poc.firstName?.[0] || "") + (poc.lastName?.[0] || "")}
                            </div>
                            <div>
                                <p className="text-[15px] font-bold text-[#1E293B]">
                                    {poc.firstName} {poc.lastName}
                                </p>
                                <p className="text-[13px] text-[#64748B] mt-0.5">{poc.designation}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                            <KVField icon={icons.mail}     label="Email"
                                value={poc.email} link={`mailto:${poc.email}`} />
                            <KVField icon={icons.phone}    label="Phone"
                                value={poc.contact} link={poc.contact ? `tel:${poc.contact}` : null} />
                            <KVField icon={icons.pin}      label="Location"  value={poc.location} />
                            <KVField icon={icons.brief}    label="Designation" value={poc.designation} />
                            {poc.linkedin && (
                                <KVField icon={icons.linkedin} label="LinkedIn"
                                    value="View Profile" link={poc.linkedin} />
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── DOCUMENTS TAB ────────────────────────────────────────────────────────────
const DocumentsTab = ({ documents, clientId }) => {

    const handleOpenDocument = async (documentId) => {
        try {
            const res = await getClientDocumentUrl(
                clientId,
                documentId
            );

            window.open(res.url, "_blank");
        } catch (err) {
            console.error(err);
            alert("Unable to open document");
        }
    };

    if (!documents?.length) {
        return (
            <EmptyState
                icon={icons.doc}
                title="No documents found"
                message="No documents have been uploaded for this client."
            />
        );
    }

    return (
        <div className="space-y-3">
            {documents.map((doc, index) => (
                <div
                    key={doc._id || index}
                    className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-4 hover:shadow-md transition"
                >
                    <div className="flex items-center justify-between gap-4">

                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                                <Icon
                                    d={icons.doc}
                                    size={18}
                                    className="text-[#2563EB]"
                                />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-[#1E293B] truncate">
                                    {doc.name || `Document ${index + 1}`}
                                </p>

                                <p className="text-[11px] text-[#94A3B8]">
                                    Uploaded{" "}
                                    {doc.uploadedAt
                                        ? fmtDate(doc.uploadedAt)
                                        : "—"}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleOpenDocument(doc._id)}
                            className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-3 py-2 text-[12px] font-medium text-white hover:bg-[#1D4ED8]"
                        >
                            <Icon d={icons.external} size={12} />
                            Open
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const CeipalCard = ({ title, children }) => (
    <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">{title}</span>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const SummaryCell = ({ label, value }) => (
    <div className="px-5 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8] mb-1">{label}</p>
        <p className="text-[13px] font-semibold text-[#1E293B]">{value || "—"}</p>
    </div>
);

const KVField = ({ icon, label, value, link }) => {
    const inner = (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-[#94A3B8] shrink-0"><Icon d={icon} size={15} /></div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8] mb-0.5">
                    {label}
                </p>
                <p className={`text-[13px] font-medium truncate ${
                    link ? "text-[#2563EB] hover:text-[#1D4ED8]" : "text-[#1E293B]"
                }`}>
                    {value || "—"}
                </p>
            </div>
        </div>
    );

    if (link) {
        return (
            <a href={link}
                target={link.startsWith("mailto") || link.startsWith("tel") ? "_self" : "_blank"}
                rel="noopener noreferrer">
                {inner}
            </a>
        );
    }
    return inner;
};

const SidebarKV = ({ label, value }) => (
    <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-[#94A3B8] shrink-0">{label}</span>
        <span className="text-[11px] font-semibold text-[#1E293B] text-right truncate max-w-32.5">
            {value || "—"}
        </span>
    </div>
);

const SidebarAction = ({ icon, label, count, onClick }) => (
    <button onClick={onClick}
        className="w-full flex items-center gap-2.5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
        <Icon d={icon} size={14} />
        {label}
        {count > 0 && (
            <span className="ml-auto rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                {count}
            </span>
        )}
    </button>
);

const EmptyState = ({ icon, title, message }) => (
    <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-12 text-center">
        <Icon d={icon} size={40} className="mx-auto text-[#CBD5E1] mb-4" />
        <p className="text-[15px] font-semibold text-[#1E293B]">{title}</p>
        <p className="text-[13px] text-[#94A3B8] mt-1">{message}</p>
    </div>
);

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
    if (!d) return "—";
    try {
        return new Date(d).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
        });
    } catch { return "—"; }
};

export default ClientDetails;