import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById, deleteJob, updateJob } from "../api/jobsApi";
import { getJobSubmissions, updateSubmission } from "../api/submissionsApi";
import { getJobInterviews } from "../api/interviewsApi";
import useRoleBase from "../hooks/useRoleBase";
import ChangeStatusModal from "../components/modals/ChangeStatusModal";
import InterviewFeedbackModal from "../components/modals/InterviewFeedbackModal";
import { getStatusStyle, INTERVIEW_STATUS_STYLES, INTERVIEW_OUTCOME_STYLES } from "../utils/submissionStatuses";
import { SubmissionsTable, InterviewsTable } from "../components/shared/PipelineTables";

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
    brief:     "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    user:      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    dollar:    "M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
    pin:       "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10m-3 0a3 3 0 106 0 3 3 0 10-6 0",
    calendar:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    clock:     "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    doc:       "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    people:    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    building:  "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
};

// ─── STATUS CONFIGS ───────────────────────────────────────────────────────────
const JOB_STATUS = {
    Open:      { bg: "#ECFDF5", text: "#065F46", dot: "#10B981", border: "#A7F3D0" },
    Closed:    { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444", border: "#FECACA" },
    "On Hold": { bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B", border: "#FDE68A" },
    Filled:    { bg: "#EFF6FF", text: "#1E40AF", dot: "#3B82F6", border: "#BFDBFE" },
};

// ─── BADGE (used for job status) ─────────────────────────────────────────────
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
const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const roleBase = useRoleBase();

    const [job, setJob]             = useState(null);
    const [submissions, setSubs]    = useState([]);
    const [interviews, setIvs]      = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState("");
    const [activeTab, setActiveTab] = useState("details");
    const [statusLoading, setStatusLoading] = useState(false);
    const [statusModalSub, setStatusModalSub] = useState(null);
    const [feedbackModalIv, setFeedbackModalIv] = useState(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                const [jobData, subsData, ivsData] = await Promise.all([
                    getJobById(id),
                    getJobSubmissions(id).catch(() => []),
                    getJobInterviews(id).catch(() => []),
                ]);
                if (active) {
                    setJob(jobData);
                    setSubs(subsData || []);
                    setIvs(ivsData || []);
                }
            } catch (err) {
                console.error(err);
                if (active) setError("Failed to load job details.");
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("Delete this job? This cannot be undone.")) return;
        try {
            await deleteJob(id);
            navigate(`${roleBase}/jobs`);
        } catch (e) {
            alert("Failed to delete job.");
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (statusLoading) return;
        setStatusLoading(true);
        try {
            const updated = await updateJob(id, { status: newStatus });
            setJob(updated);
        } catch (e) {
            alert("Failed to update status.");
        } finally {
            setStatusLoading(false);
        }
    };

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9]">
            <div className="flex flex-col items-center gap-3">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2563EB]" />
                <span className="text-[13px] text-[#94A3B8]">Loading job…</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9] p-4">
            <div className="rounded-xl border border-red-200 bg-white px-8 py-6 text-center shadow-sm">
                <p className="text-[15px] font-semibold text-red-600 mb-3">{error}</p>
                <button onClick={() => navigate(`${roleBase}/jobs`)}
                    className="rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8]">
                    Back to Jobs
                </button>
            </div>
        </div>
    );

    if (!job) return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9] p-4">
            <div className="rounded-xl border border-[#E2E8F0] bg-white px-8 py-6 text-center shadow-sm">
                <p className="text-[15px] font-semibold text-[#1E293B] mb-1">Job not found</p>
                <p className="text-[13px] text-[#94A3B8] mb-4">This job doesn't exist or was deleted.</p>
                <button onClick={() => navigate(`${roleBase}/jobs`)}
                    className="rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8]">
                    Back to Jobs
                </button>
            </div>
        </div>
    );

    const daysOpen = job.dateOpened
        ? Math.floor((Date.now() - new Date(job.dateOpened)) / 86400000)
        : null;

    const tabs = [
        { id: "details",     label: "Job Details"  },
        { id: "submissions", label: "Submissions",  count: submissions.length },
        { id: "interviews",  label: "Interviews",   count: interviews.length  },
    ];

    return (
        <>
        <div className="min-h-screen bg-[#F4F6F9]">

            {/* ═══ STICKY HEADER ═══ */}
            <div className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] shadow-sm">

                {/* Row 1: back + identity + actions */}
                <div className="flex items-center gap-4 px-6 py-3 border-b border-[#F1F5F9]">
                    <button onClick={() => navigate(`${roleBase}/jobs`)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC] transition shrink-0">
                        <Icon d={icons.back} size={15} />
                    </button>

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                            <Icon d={icons.brief} size={20} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-[17px] font-bold text-[#1E293B] truncate">{job.title}</h1>
                                {job.code && (
                                    <span className="rounded-md bg-[#EFF6FF] px-2.5 py-1 text-[13px] font-bold text-[#2563EB]">
                                        {job.code}
                                    </span>
                                )}
                                <Badge label={job.status} map={JOB_STATUS} />
                                {daysOpen !== null && (
                                    <span className={`text-[11px] font-semibold ${
                                        daysOpen > 30 ? "text-red-500" : daysOpen > 14 ? "text-amber-500" : "text-[#94A3B8]"
                                    }`}>{daysOpen}d open</span>
                                )}
                            </div>
                            {job.client && <p className="text-[12px] text-[#64748B] mt-0.5">{job.client}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => navigate(`${roleBase}/jobs/edit/${id}`)}
                            className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                            <Icon d={icons.edit} size={13} /> Edit
                        </button>
                        <button onClick={handleDelete}
                            className="flex items-center gap-1.5 rounded-lg border border-[#FECACA] bg-white px-3 py-1.5 text-[12px] font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition">
                            <Icon d={icons.trash} size={13} /> Delete
                        </button>
                    </div>
                </div>

                {/* Row 2: tabs */}
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
                                    activeTab === tab.id ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#F1F5F9] text-[#64748B]"
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

                    {activeTab === "details" && (
                        <>
                            {/* Summary Grid */}
                            <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
                                <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3">
                                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">Summary</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#F1F5F9]">
                                    <SummaryCell label="Job Type"   value={job.jobType} />
                                    <SummaryCell label="Experience" value={job.experience} />
                                    <SummaryCell label="Salary"     value={job.salary} />
                                    <SummaryCell label="Industry"   value={job.industry} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#F1F5F9] border-t border-[#F1F5F9]">
                                    <SummaryCell label="City"           value={job.city} />
                                    <SummaryCell label="Country"        value={job.country} />
                                    <SummaryCell label="Recruiter"      value={job.recruiter} />
                                    <SummaryCell label="Hiring Manager" value={job.manager} />
                                </div>
                            </div>

                            {/* Position Info */}
                            <CeipalCard title="Position Information">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <KVField icon={icons.brief}    label="Job Title"   value={job.title} />
                                    <KVField icon={icons.building} label="Client"      value={job.client} />
                                    <KVField icon={icons.brief}    label="Job Type"    value={job.jobType} />
                                    <KVField icon={icons.brief}    label="Experience"  value={job.experience} />
                                    <KVField icon={icons.dollar}   label="Salary/Rate" value={job.salary} />
                                    <KVField icon={icons.building} label="Industry"    value={job.industry} />
                                </div>
                            </CeipalCard>

                            {/* Assignment */}
                            <CeipalCard title="Assignment">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <KVField icon={icons.user} label="Hiring Manager" value={job.manager} />
                                    <KVField icon={icons.user} label="Recruiter"      value={job.recruiter} />
                                    <KVField icon={icons.user} label="Contact Person" value={job.contact} />
                                </div>
                            </CeipalCard>

                            {/* Location */}
                            <CeipalCard title="Location">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <KVField icon={icons.pin} label="City"    value={job.city} />
                                    <KVField icon={icons.pin} label="Country" value={job.country} />
                                </div>
                            </CeipalCard>

                            {/* Timeline */}
                            <CeipalCard title="Timeline">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <KVField icon={icons.calendar} label="Date Opened"
                                        value={job.dateOpened ? fmtDate(job.dateOpened) : null} />
                                    <KVField icon={icons.calendar} label="Target Date"
                                        value={job.targetDate ? fmtDate(job.targetDate) : null} />
                                    <KVField icon={icons.calendar} label="Created"
                                        value={job.createdAt ? fmtDate(job.createdAt) : null} />
                                </div>
                            </CeipalCard>

                            {/* Skills */}
                            {job.skills && (
                                <CeipalCard title="Required Skills">
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.split(",").filter(Boolean).map((s, i) => (
                                            <span key={i}
                                                className="rounded-md border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1 text-[12px] font-medium text-[#1D4ED8]">
                                                {s.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </CeipalCard>
                            )}

                            {/* Description */}
                            {job.description && (
                                <CeipalCard title="Job Description">
                                    <p className="text-[13px] leading-7 text-[#475569] whitespace-pre-wrap">
                                        {job.description}
                                    </p>
                                </CeipalCard>
                            )}

                            {/* Post Info */}
                            {job.postInfo && (
                                <CeipalCard title="Posting Information">
                                    <p className="text-[13px] leading-7 text-[#475569] whitespace-pre-wrap">
                                        {job.postInfo}
                                    </p>
                                </CeipalCard>
                            )}
                        </>
                    )}

                    {activeTab === "submissions" && (
                        <SubmissionsTab submissions={submissions} roleBase={roleBase} navigate={navigate}
                            onChangeStatus={(s) => setStatusModalSub(s)} />
                    )}

                    {activeTab === "interviews" && (
                        <InterviewsTab interviews={interviews} roleBase={roleBase} navigate={navigate}
                            onFeedback={(iv) => setFeedbackModalIv(iv)} />
                    )}
                </div>

                {/* ── Right Sidebar ── */}
                <div className="w-[240px] shrink-0 border-l border-[#E2E8F0] bg-white flex flex-col">

                    {/* Status */}
                    <div className="border-b border-[#F1F5F9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Job Status</p>
                        <div className="mb-2"><Badge label={job.status} map={JOB_STATUS} /></div>
                        <select value={job.status} onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={statusLoading}
                            className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[12px] font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50">
                            {["Open", "Closed", "On Hold", "Filled"].map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Quick Actions */}
                    <div className="border-b border-[#F1F5F9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Quick Actions</p>
                        <div className="space-y-2">
                            <button onClick={() => setActiveTab("submissions")}
                                className="w-full flex items-center gap-2.5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                                <Icon d={icons.people} size={14} />
                                View Submissions
                                {submissions.length > 0 && (
                                    <span className="ml-auto rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                                        {submissions.length}
                                    </span>
                                )}
                            </button>
                            <button onClick={() => setActiveTab("interviews")}
                                className="w-full flex items-center gap-2.5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                                <Icon d={icons.calendar} size={14} />
                                View Interviews
                                {interviews.length > 0 && (
                                    <span className="ml-auto rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                                        {interviews.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="border-b border-[#F1F5F9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Quick Info</p>
                        <div className="space-y-2.5">
                            <SidebarKV label="Client"     value={job.client} />
                            <SidebarKV label="Job Type"   value={job.jobType} />
                            <SidebarKV label="Experience" value={job.experience} />
                            <SidebarKV label="Salary"     value={job.salary} />
                            <SidebarKV label="Location"   value={[job.city, job.country].filter(Boolean).join(", ")} />
                        </div>
                    </div>

                    {/* Key Dates + Days Open indicator */}
                    <div className="p-4 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Key Dates</p>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] text-[#94A3B8]">Date Opened</p>
                                <p className="text-[12px] font-semibold text-[#1E293B]">
                                    {job.dateOpened ? fmtDate(job.dateOpened) : "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#94A3B8]">Target Date</p>
                                <p className="text-[12px] font-semibold text-[#1E293B]">
                                    {job.targetDate ? fmtDate(job.targetDate) : "—"}
                                </p>
                            </div>
                            {daysOpen !== null && (
                                <div className={`rounded-lg px-3 py-2.5 mt-1 border ${
                                    daysOpen > 30
                                        ? "bg-[#FEF2F2] border-[#FECACA]"
                                        : daysOpen > 14
                                        ? "bg-[#FFFBEB] border-[#FDE68A]"
                                        : "bg-[#F0FDF4] border-[#A7F3D0]"
                                }`}>
                                    <p className="text-[10px] font-medium text-[#94A3B8]">Days Open</p>
                                    <p className={`text-[22px] font-bold leading-tight ${
                                        daysOpen > 30 ? "text-[#DC2626]" : daysOpen > 14 ? "text-[#D97706]" : "text-[#059669]"
                                    }`}>{daysOpen}</p>
                                    <p className="text-[10px] mt-0.5 text-[#94A3B8]">
                                        {daysOpen > 30 ? "Urgent — fill soon" : daysOpen > 14 ? "Getting lengthy" : "On track"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* ═══════════════ MODALS ═══════════════ */}
        {statusModalSub && (
            <ChangeStatusModal
                submission={statusModalSub}
                onClose={() => setStatusModalSub(null)}
                onSuccess={async () => {
                    const fresh = await getJobSubmissions(id).catch(() => []);
                    setSubs(fresh || []);
                    setStatusModalSub(null);
                }}
            />
        )}
        {feedbackModalIv && (
            <InterviewFeedbackModal
                interview={feedbackModalIv}
                onClose={() => setFeedbackModalIv(null)}
                onSuccess={async () => {
                    const [freshSubs, freshIvs] = await Promise.all([
                        getJobSubmissions(id).catch(() => []),
                        getJobInterviews(id).catch(() => []),
                    ]);
                    setSubs(freshSubs || []);
                    setIvs(freshIvs || []);
                    setFeedbackModalIv(null);
                }}
            />
        )}
        </>
    );
};

// ─── SUBMISSIONS TAB ──────────────────────────────────────────────────────────
const SubmissionsTab = ({ submissions, roleBase, navigate, onChangeStatus }) => {
    // Pipeline funnel summary counts
    const counts = {
        validation:  submissions.filter((s) => s.status === "For Validation").length,
        submitted:   submissions.filter((s) => s.status === "Submitted To Client").length,
        interview:   submissions.filter((s) => s.status && (s.status.includes("Schedule") || s.status.includes("Scheduled") || s.status.includes("Feedback"))).length,
        finalSelect: submissions.filter((s) => s.status === "Final Select" || s.status === "HR Discussion" || s.status === "Offer Sent" || s.status === "Offer Accepted").length,
        joined:      submissions.filter((s) => s.status === "Joined").length,
        rejected:    submissions.filter((s) => s.status && (s.status.includes("Reject") || s.status === "BGV Failed" || s.status === "Absconded")).length,
    };

    return (
        <div className="space-y-5">
            {/* Pipeline funnel */}
            {submissions.length > 0 && (
                <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
                    <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-2.5">
                        <span className="text-[10.5px] font-semibold uppercase tracking-widest text-[#94A3B8]">Pipeline Overview</span>
                    </div>
                    <div className="grid grid-cols-6 divide-x divide-[#F1F5F9]">
                        {[
                            { label: "Validation",   value: counts.validation,  color: "#3B82F6" },
                            { label: "Submitted",    value: counts.submitted,   color: "#EA580C" },
                            { label: "Interviewing", value: counts.interview,   color: "#7C3AED" },
                            { label: "Final Stage",  value: counts.finalSelect, color: "#10B981" },
                            { label: "Joined",       value: counts.joined,      color: "#059669" },
                            { label: "Rejected",     value: counts.rejected,    color: "#EF4444" },
                        ].map((s) => (
                            <div key={s.label} className="flex flex-col items-center px-3 py-3">
                                <p className="text-[20px] font-bold" style={{ color: s.color }}>{s.value}</p>
                                <p className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-[#94A3B8] text-center">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <SubmissionsTable
                submissions={submissions}
                context="job"
                onChangeStatus={onChangeStatus}
                onRowClick={(row) => navigate(`${roleBase}/candidates/${row.candidate?._id || row.candidate}`)}
            />
        </div>
    );
};

// ─── INTERVIEWS TAB ───────────────────────────────────────────────────────────
const InterviewsTab = ({ interviews, roleBase, navigate, onFeedback }) => {
    const stats = [
        { label: "Total",     value: interviews.length,                                                                     color: "#2563EB" },
        { label: "Scheduled", value: interviews.filter((iv) => iv.status === "Scheduled").length,                           color: "#7C3AED" },
        { label: "Completed", value: interviews.filter((iv) => iv.status === "Completed").length,                           color: "#059669" },
        { label: "Cancelled", value: interviews.filter((iv) => iv.status === "Cancelled" || iv.status === "No Show").length, color: "#DC2626" },
    ];

    return (
        <div className="space-y-5">
            {interviews.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                    {stats.map((s) => (
                        <div key={s.label} className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm p-4 text-center">
                            <p className="text-[24px] font-bold" style={{ color: s.color }}>{s.value}</p>
                            <p className="text-[11px] font-medium text-[#94A3B8] mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            )}
            <InterviewsTable
                interviews={interviews}
                context="job"
                onFeedback={onFeedback}
                onRowClick={(row) => navigate(`${roleBase}/candidates/${row.candidate?._id || row.candidate}`)}
            />
        </div>
    );
};


// ─── SHARED SMALL COMPONENTS ──────────────────────────────────────────────────
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

const KVField = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 text-[#94A3B8] shrink-0"><Icon d={icon} size={15} /></div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8] mb-0.5">{label}</p>
            <p className="text-[13px] font-medium text-[#1E293B]">{value || "—"}</p>
        </div>
    </div>
);

const SidebarKV = ({ label, value }) => (
    <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-[#94A3B8] shrink-0">{label}</span>
        <span className="text-[11px] font-semibold text-[#1E293B] text-right truncate max-w-[130px]">{value || "—"}</span>
    </div>
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
    try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
    catch { return "—"; }
};

const initials = (name = "") =>
    name.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";

export default JobDetails;