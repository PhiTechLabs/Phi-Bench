import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubmission, updateSubmission } from "../api/submissionsApi";
import { getCandidateInterviews } from "../api/interviewsApi";
import ChangeStatusModal from "../components/modals/ChangeStatusModal";
import InterviewFeedbackModal from "../components/modals/InterviewFeedbackModal";
import ScheduleInterviewModal from "../components/modals/ScheduleInterviewModal";
import useRoleBase from "../hooks/useRoleBase";
import {
    getStatusStyle,
    getAllowedTransitions,
    INTERVIEW_STATUS_STYLES,
    INTERVIEW_OUTCOME_STYLES,
} from "../utils/submissionStatuses";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d={d} />
    </svg>
);

const icons = {
    back:      "M19 12H5M12 19l-7-7 7-7",
    user:      "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
    brief:     "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    building:  "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
    calendar:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    clock:     "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    arrow:     "M5 12h14M12 5l7 7-7 7",
    check:     "M20 6L9 17l-5-5",
    note:      "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    activity:  "M22 12h-4l-3 9L9 3l-3 9H2",
    interview: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z",
    star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    add:       "M12 5v14M5 12h14",
    link:      "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
    warn:      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    lock:      "M12 15v2m-6 6h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    x:         "M6 18L18 6M6 6l12 12",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return "—"; }
};
const fmtDateTime = (d, t) => {
    if (!d) return "—";
    const base = new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", weekday: "short" });
    return t ? `${base} · ${t}` : base;
};
const daysAgo = (d) => {
    if (!d) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000));
};
const initials = (n = "") =>
    n.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

// ─── PIPELINE STAGES ─────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
    { id: "validation",   label: "Validation",  statuses: ["For Validation","Need More Info","Internal Hold","Internal Reject"] },
    { id: "submitted",    label: "Submitted",   statuses: ["Submitted To Client","Duplicate","Hold by Client","Screen Reject","Position Closed"] },
    { id: "interviewing", label: "Interviewing",statuses: (s) => s && (s.includes("Schedule") || s.includes("Scheduled") || s.includes("Feedback") || s.includes("Rescheduled") || s.includes("Backout") || (s.includes("Rejected") && s.startsWith("L"))) },
    { id: "final",        label: "Final Stage", statuses: ["Final Select","HR Discussion","Final Backout"] },
    { id: "offer",        label: "Offer",       statuses: ["Offer Sent","Offer Accepted","BGV Failed","Offer Rejected","Offer Withdrawn"] },
    { id: "placement",    label: "Placement",   statuses: ["Joined","Joining Backout","Absconded","Project Completed","Project Ended","Replacement Term Ended"] },
];

const getStageIndex = (status) => {
    if (!status) return 0;
    return PIPELINE_STAGES.findIndex((stage) => {
        if (typeof stage.statuses === "function") return stage.statuses(status);
        return stage.statuses.includes(status);
    });
};

// ─── STATUS BADGE — matches CandidateDetails StatusBadge exactly ─────────────
const StatusBadge = ({ status, styleMap }) => {
    const s = styleMap
        ? (styleMap[status] || { bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF" })
        : getStatusStyle(status);
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
            style={{ background: s.bg, color: s.text, borderColor: s.border || s.dot + "55" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
            {status}
        </span>
    );
};

// ─── CARD — matches CandidateDetails CeipalCard ──────────────────────────────
const CeipalCard = ({ title, children, action }) => (
    <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">{title}</span>
            {action && <div>{action}</div>}
        </div>
        <div className="p-5">{children}</div>
    </div>
);

// ─── KV ROW — matches CandidateDetails KV ────────────────────────────────────
const KV = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4">
        <span className="text-[12px] text-[#94A3B8] shrink-0">{label}</span>
        <span className="text-[12px] font-semibold text-[#1E293B] text-right">{value || "—"}</span>
    </div>
);

// ─── SIDEBAR KV ──────────────────────────────────────────────────────────────
const SidebarKV = ({ label, value }) => (
    <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-[#94A3B8]">{label}</span>
        <span className="text-[11px] font-semibold text-[#1E293B] text-right truncate max-w-[140px]">{value || "—"}</span>
    </div>
);

// ─── SUMMARY CELL — matches CandidateDetails SummaryCell ─────────────────────
const SummaryCell = ({ label, value, isNode = false }) => (
    <div className="px-5 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8] mb-1">{label}</p>
        {isNode
            ? <div>{value}</div>
            : <p className="text-[13px] font-semibold text-[#1E293B]">{value || "—"}</p>
        }
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const SubmissionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const roleBase = useRoleBase();

    const [submission,  setSubmission]  = useState(null);
    const [interviews,  setInterviews]  = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState("");
    const [activeTab,   setActiveTab]   = useState("overview");
    const [noteText,    setNoteText]    = useState("");
    const [savingNote,  setSavingNote]  = useState(false);
    const [noteSaved,   setNoteSaved]   = useState(false);

    // modals
    const [showStatus,   setShowStatus]   = useState(false);
    const [showFeedback, setShowFeedback] = useState(null);
    const [showSchedule, setShowSchedule] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const sub = await getSubmission(id);
            const candidateId = sub?.candidate?._id || sub?.candidate;
            const jobId       = sub?.job?._id || sub?.job;
            const ivs = candidateId
                ? await getCandidateInterviews(candidateId).catch(() => [])
                : [];
            setSubmission(sub);
            setInterviews(ivs.filter((iv) => {
                const ivJob = iv.job?._id || iv.job;
                return String(ivJob) === String(jobId);
            }));
            setNoteText(sub?.recruiterNotes || "");
        } catch (e) {
            setError("Could not load submission.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const saveNote = async () => {
        if (!noteText.trim()) return;
        setSavingNote(true);
        try {
            const updated = await updateSubmission(id, { recruiterNotes: noteText.trim() });
            setSubmission(updated);
            setNoteSaved(true);
            setTimeout(() => setNoteSaved(false), 2000);
        } finally { setSavingNote(false); }
    };

    // ── LOADING ──
    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9]">
            <div className="flex flex-col items-center gap-3">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2563EB]" />
                <span className="text-[13px] text-[#94A3B8]">Loading submission…</span>
            </div>
        </div>
    );

    // ── ERROR ──
    if (error) return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9] p-4">
            <div className="rounded-xl border border-red-200 bg-white px-8 py-6 text-center shadow-sm">
                <div className="text-[15px] font-semibold text-red-600 mb-3">{error}</div>
                <button onClick={() => navigate(`${roleBase}/submissions`)}
                    className="rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8]">
                    Back to Submissions
                </button>
            </div>
        </div>
    );

    // ── NOT FOUND ──
    if (!submission) return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9] p-4">
            <div className="rounded-xl border border-[#E2E8F0] bg-white px-8 py-6 text-center shadow-sm">
                <div className="text-[15px] font-semibold text-[#1E293B] mb-1">Submission not found</div>
                <p className="text-[13px] text-[#94A3B8] mb-4">This submission doesn't exist.</p>
                <button onClick={() => navigate(`${roleBase}/submissions`)}
                    className="rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8]">
                    Back to Submissions
                </button>
            </div>
        </div>
    );

    // ── derived ──────────────────────────────────────────────────────────────
    const candidateId = submission.candidate?._id || submission.candidate;
    const jobId       = submission.job?._id || submission.job;
    const statusStyle = getStatusStyle(submission.status);
    const stageIndex  = getStageIndex(submission.status);
    const allowed     = getAllowedTransitions(submission.status);
    const daysInPipe  = daysAgo(submission.submittedDate || submission.createdAt);
    const lastUpdate  = submission.statusHistory?.length
        ? submission.statusHistory[submission.statusHistory.length - 1]
        : null;
    const completedInterviews = interviews.filter((iv) => iv.status === "Completed" || iv.outcome);
    const pendingInterviews   = interviews.filter((iv) => iv.status === "Scheduled" || iv.status === "Rescheduled");

    const TABS = [
        { id: "overview",   label: "Overview" },
        { id: "pipeline",   label: "Pipeline",   badge: submission.statusHistory?.length },
        { id: "interviews", label: "Interviews", badge: interviews.length },
        { id: "notes",      label: "Notes" },
    ];

    return (
        <div className="min-h-screen bg-[#F4F6F9]">

            {/* ═══════════════ TOP HEADER BAR ═══════════════ */}
            <div className="sticky top-0 z-10 bg-white border-b border-[#E2E8F0] shadow-sm">

                {/* Row 1: Back + Identity + Actions */}
                <div className="flex items-center gap-4 px-6 py-3 border-b border-[#F1F5F9]">

                    {/* Back */}
                    <button onClick={() => navigate(`${roleBase}/submissions`)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC] transition shrink-0">
                        <Icon d={icons.back} size={15} />
                    </button>

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center text-white text-[16px] font-bold shadow">
                            {initials(submission.candidateName)}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-[17px] font-bold text-[#1E293B] leading-tight truncate">
                                    {submission.candidateName || "Unknown Candidate"}
                                </h1>
                                <StatusBadge status={submission.status} />
                            </div>
                            <p className="text-[12px] text-[#64748B] mt-0.5">
                                {submission.jobTitle || "—"}
                                {submission.clientName ? ` · ${submission.clientName}` : ""}
                            </p>
                        </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        {allowed.length > 0 && (
                            <button onClick={() => setShowStatus(true)}
                                className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                                <Icon d={icons.arrow} size={13} />
                                Move Status
                            </button>
                        )}
                        <button onClick={() => setShowSchedule(true)}
                            className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                            <Icon d={icons.calendar} size={13} />
                            Schedule Interview
                        </button>
                    </div>
                </div>

                {/* Row 2: Tabs */}
                <div className="flex items-center gap-0 px-6">
                    {TABS.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 text-[13px] font-medium border-b-2 transition ${
                                activeTab === tab.id
                                    ? "border-[#2563EB] text-[#2563EB]"
                                    : "border-transparent text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC]"
                            }`}>
                            {tab.label}
                            {tab.badge > 0 && (
                                <span className={`rounded-full text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center ${
                                    activeTab === tab.id
                                        ? "bg-[#2563EB] text-white"
                                        : "bg-[#E2E8F0] text-[#64748B]"
                                }`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══════════════ MAIN LAYOUT ═══════════════ */}
            <div className="flex gap-0 h-full">

                {/* ── LEFT / MAIN CONTENT ── */}
                <div className="flex-1 min-w-0 p-6 space-y-5 overflow-auto">

                    {/* ══ OVERVIEW TAB ══ */}
                    {activeTab === "overview" && (
                        <>
                            {/* Summary Card — matches CandidateDetails summary grid */}
                            <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
                                <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3">
                                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">Summary</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-[#F1F5F9]">
                                    <SummaryCell label="Job Title"       value={submission.jobTitle} />
                                    <SummaryCell label="Client"          value={submission.clientName} />
                                    <SummaryCell label="Submitted On"    value={fmtDate(submission.submittedDate || submission.createdAt)} />
                                    <SummaryCell label="Days in Pipeline" value={daysInPipe ? `${daysInPipe} days` : "—"} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-[#F1F5F9] border-t border-[#F1F5F9]">
                                    <SummaryCell label="Status"       value={<StatusBadge status={submission.status} />} isNode />
                                    <SummaryCell label="Stage"        value={PIPELINE_STAGES[stageIndex]?.label || "—"} />
                                    <SummaryCell label="Interviews"   value={`${interviews.length} total`} />
                                    <SummaryCell label="Last Updated" value={fmtDate(lastUpdate?.changedAt)} />
                                </div>
                            </div>

                            {/* Pipeline Stepper */}
                            <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
                                <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3">
                                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">Pipeline Stage</span>
                                </div>
                                <div className="px-6 py-5">
                                    <div className="relative flex items-start">
                                        {/* background track */}
                                        <div className="absolute top-[18px] left-0 right-0 h-[2px] bg-[#E2E8F0] z-0" />
                                        {/* completed progress */}
                                        <div className="absolute top-[18px] left-0 h-[2px] z-0 transition-all duration-500"
                                            style={{
                                                background: "linear-gradient(90deg,#059669,#10B981)",
                                                width: stageIndex === 0
                                                    ? "0%"
                                                    : `${(stageIndex / (PIPELINE_STAGES.length - 1)) * 100}%`,
                                            }} />
                                        {/* active partial fill */}
                                        {stageIndex < PIPELINE_STAGES.length - 1 && (
                                            <div className="absolute top-[18px] h-[2px] z-0 transition-all duration-500"
                                                style={{
                                                    background: `${statusStyle.dot}`,
                                                    left:  `${(stageIndex / (PIPELINE_STAGES.length - 1)) * 100}%`,
                                                    width: `${(1 / (PIPELINE_STAGES.length - 1)) * 100 * 0.4}%`,
                                                }} />
                                        )}
                                        {/* stage nodes */}
                                        {PIPELINE_STAGES.map((stage, i) => {
                                            const isCompleted = i < stageIndex;
                                            const isActive    = i === stageIndex;
                                            return (
                                                <div key={stage.id} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] transition-all duration-300"
                                                        style={{
                                                            background:  isCompleted ? "#059669" : isActive ? statusStyle.dot : "#fff",
                                                            borderColor: isCompleted ? "#059669" : isActive ? statusStyle.dot : "#D1D5DB",
                                                            boxShadow:   isActive ? `0 0 0 4px ${statusStyle.dot}22` : "none",
                                                        }}>
                                                        {isCompleted ? (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                                stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M20 6L9 17l-5-5" />
                                                            </svg>
                                                        ) : isActive ? (
                                                            <div className="h-2.5 w-2.5 rounded-full bg-white" />
                                                        ) : (
                                                            <div className="h-2 w-2 rounded-full bg-[#D1D5DB]" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1 text-center">
                                                        <p className="text-[11px] font-bold leading-tight"
                                                            style={{
                                                                color: isCompleted ? "#059669"
                                                                     : isActive    ? statusStyle.text
                                                                     : "#94A3B8",
                                                            }}>
                                                            {stage.label}
                                                        </p>
                                                        {isActive && (
                                                            <span className="rounded-full border px-2 py-0.5 text-[9.5px] font-bold whitespace-nowrap"
                                                                style={{
                                                                    background:  statusStyle.bg,
                                                                    color:       statusStyle.text,
                                                                    borderColor: statusStyle.dot + "55",
                                                                }}>
                                                                {submission.status}
                                                            </span>
                                                        )}
                                                        {isCompleted && (
                                                            <span className="text-[9.5px] font-semibold text-[#10B981]">Done</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Candidate & Submission Details */}
                            <CeipalCard title="Submission Details">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <KV label="Full Name"    value={submission.candidateName} />
                                    <KV label="Job Applied"  value={submission.jobTitle} />
                                    <KV label="Client"       value={submission.clientName} />
                                    <KV label="Submitted On" value={fmtDate(submission.submittedDate || submission.createdAt)} />
                                    <KV label="Last Updated" value={fmtDate(lastUpdate?.changedAt)} />
                                    <KV label="Created By"   value={submission.createdBy?.username || "—"} />
                                </div>
                                <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
                                    <button onClick={() => navigate(`${roleBase}/candidates/${candidateId}`)}
                                        className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                                        <Icon d={icons.link} size={13} />
                                        View Full Candidate Profile
                                    </button>
                                </div>
                            </CeipalCard>

                            {/* Interview quick summary */}
                            {interviews.length > 0 && (
                                <CeipalCard title="Interview Summary"
                                    action={
                                        <button onClick={() => setActiveTab("interviews")}
                                            className="text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                                            View all <Icon d={icons.arrow} size={11} />
                                        </button>
                                    }>
                                    <div className="divide-y divide-[#F1F5F9] -mx-5 -mb-5">
                                        {interviews.slice(0, 3).map((iv) => {
                                            const canFeedback = iv.status === "Scheduled" || iv.status === "Rescheduled";
                                            return (
                                                <div key={iv._id || iv.id} className="flex items-center gap-4 px-5 py-3.5">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-white text-[11px] shrink-0"
                                                        style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)" }}>
                                                        {iv.interviewRound || "L1"}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[13px] font-semibold text-[#1E293B]">
                                                            {iv.interviewRound} — {iv.interviewType}
                                                        </p>
                                                        <p className="text-[11px] text-[#94A3B8] mt-0.5">
                                                            {fmtDateTime(iv.scheduledDate, iv.scheduledTime)}
                                                            {iv.duration && ` · ${iv.duration} min`}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <StatusBadge status={iv.status} styleMap={INTERVIEW_STATUS_STYLES} />
                                                        {iv.outcome && (
                                                            <StatusBadge status={iv.outcome} styleMap={INTERVIEW_OUTCOME_STYLES} />
                                                        )}
                                                        {canFeedback && (
                                                            <button onClick={() => setShowFeedback(iv)}
                                                                className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-1 text-[11px] font-semibold text-[#16A34A] hover:bg-[#DCFCE7] transition">
                                                                Feedback
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CeipalCard>
                            )}
                        </>
                    )}

                    {/* ══ PIPELINE TAB ══ */}
                    {activeTab === "pipeline" && (
                        <CeipalCard title={`Status Timeline · ${submission.statusHistory?.length || 0} changes`}>
                            {(!submission.statusHistory || submission.statusHistory.length === 0) ? (
                                <div className="py-10 text-center text-[13px] text-[#94A3B8]">
                                    No history recorded yet.
                                </div>
                            ) : (
                                <div className="relative -mx-5 -mb-5">
                                    {/* vertical line */}
                                    <div className="absolute left-[37px] top-4 bottom-4 w-px bg-gradient-to-b from-[#E2E8F0] to-transparent" />
                                    <div className="space-y-0">
                                        {[...submission.statusHistory].reverse().map((h, i, arr) => {
                                            const st       = getStatusStyle(h.status);
                                            const isLatest = i === 0;
                                            const isFirst  = i === arr.length - 1;
                                            return (
                                                <div key={i} className="relative flex gap-4 px-5 py-4 border-b border-[#F1F5F9] last:border-0">
                                                    {/* dot */}
                                                    <div className="shrink-0 relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-sm"
                                                        style={{
                                                            background:  isLatest ? st.bg : "#F8FAFC",
                                                            borderColor: isLatest ? st.dot : "#E2E8F0",
                                                        }}>
                                                        {isLatest
                                                            ? <span className="h-2.5 w-2.5 rounded-full" style={{ background: st.dot }} />
                                                            : <Icon d={icons.check} size={13} className="text-[#CBD5E1]" />
                                                        }
                                                    </div>
                                                    {/* content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-3 flex-wrap">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <StatusBadge status={h.status} />
                                                                {isLatest && (
                                                                    <span className="rounded-full bg-[#1E293B] px-2 py-0.5 text-[9.5px] font-bold text-white uppercase tracking-wide">
                                                                        Current
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <p className="text-[11px] font-semibold text-[#475569]">
                                                                    {fmtDate(h.changedAt)}
                                                                </p>
                                                                {h.changedBy?.username && (
                                                                    <p className="text-[10px] text-[#94A3B8] mt-0.5">
                                                                        by {h.changedBy.username}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {h.note && h.note !== "Submission created" && (
                                                            <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
                                                                <Icon d={icons.note} size={12} className="text-[#94A3B8] mt-0.5 shrink-0" />
                                                                <p className="text-[12px] text-[#475569] italic">{h.note}</p>
                                                            </div>
                                                        )}
                                                        {isFirst && (
                                                            <p className="mt-1 text-[10.5px] text-[#94A3B8]">Submission created</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CeipalCard>
                    )}

                    {/* ══ INTERVIEWS TAB ══ */}
                    {activeTab === "interviews" && (
                        <>
                            {/* Stats row */}
                            {interviews.length > 0 && (
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { label: "Total",     value: interviews.length,                                                        color: "#2563EB", bg: "#EFF6FF" },
                                        { label: "Scheduled", value: interviews.filter(iv => iv.status === "Scheduled").length,                color: "#7C3AED", bg: "#F5F3FF" },
                                        { label: "Completed", value: completedInterviews.length,                                               color: "#059669", bg: "#ECFDF5" },
                                        { label: "Cancelled", value: interviews.filter(iv => iv.status === "Cancelled" || iv.status === "No Show").length, color: "#DC2626", bg: "#FEF2F2" },
                                    ].map((s) => (
                                        <div key={s.label} className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm p-4 text-center">
                                            <p className="text-[22px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
                                            <p className="text-[10px] font-semibold text-[#94A3B8] mt-1.5 uppercase tracking-widest">{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {interviews.length === 0 ? (
                                <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
                                    <div className="flex flex-col items-center gap-3 py-14 px-6 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                                            <Icon d={icons.calendar} size={22} />
                                        </div>
                                        <p className="text-[14px] font-semibold text-[#1E293B]">No interviews yet</p>
                                        <p className="text-[12px] text-[#94A3B8]">Schedule the first interview for this submission.</p>
                                        <button onClick={() => setShowSchedule(true)}
                                            className="mt-2 flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1D4ED8] transition">
                                            <Icon d={icons.add} size={14} />
                                            Schedule Interview
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {interviews.map((iv) => {
                                        const canFeedback = iv.status === "Scheduled" || iv.status === "Rescheduled";
                                        return (
                                            <div key={iv._id || iv.id}
                                                className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
                                                <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg font-bold text-white text-[11px]"
                                                            style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)" }}>
                                                            {iv.interviewRound || "L1"}
                                                        </div>
                                                        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
                                                            {iv.interviewRound} Round — {iv.interviewType}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <StatusBadge status={iv.status} styleMap={INTERVIEW_STATUS_STYLES} />
                                                        {iv.outcome && (
                                                            <StatusBadge status={iv.outcome} styleMap={INTERVIEW_OUTCOME_STYLES} />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-5">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                        <KV label="Date & Time" value={fmtDateTime(iv.scheduledDate, iv.scheduledTime)} />
                                                        {iv.duration && <KV label="Duration"   value={`${iv.duration} min`} />}
                                                        {iv.interviewers?.length > 0 && (
                                                            <KV label="Interviewers" value={iv.interviewers.join(", ")} />
                                                        )}
                                                        {iv.meetingLink && (
                                                            <div className="flex items-start justify-between gap-4">
                                                                <span className="text-[12px] text-[#94A3B8] shrink-0">Meeting Link</span>
                                                                <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer"
                                                                    className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] text-right truncate max-w-[200px]">
                                                                    Join Meeting
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* feedback block */}
                                                    {(iv.feedback || iv.rating) && (
                                                        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 mb-3">
                                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8] mb-2">Feedback</p>
                                                            {iv.rating && (
                                                                <div className="flex items-center gap-1.5 mb-2">
                                                                    {[1,2,3,4,5].map((n) => (
                                                                        <svg key={n} width={15} height={15} viewBox="0 0 24 24"
                                                                            fill={n <= iv.rating ? "#F59E0B" : "none"}
                                                                            stroke={n <= iv.rating ? "#F59E0B" : "#D1D5DB"} strokeWidth="1.5">
                                                                            <path d={icons.star} />
                                                                        </svg>
                                                                    ))}
                                                                    <span className="text-[11px] font-semibold text-[#92400E] ml-1">
                                                                        {["","Poor","Fair","Good","Very Good","Excellent"][iv.rating]}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {iv.feedback && (
                                                                <p className="text-[12px] text-[#475569] leading-relaxed">{iv.feedback}</p>
                                                            )}
                                                            {iv.notes && (
                                                                <p className="mt-1.5 text-[11px] text-[#94A3B8] italic">
                                                                    Internal: {iv.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {canFeedback && (
                                                        <button onClick={() => setShowFeedback(iv)}
                                                            className="flex items-center gap-1.5 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-1.5 text-[12px] font-semibold text-[#16A34A] hover:bg-[#DCFCE7] transition">
                                                            <Icon d={icons.note} size={13} />
                                                            Submit Feedback
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {/* ══ NOTES TAB ══ */}
                    {activeTab === "notes" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <CeipalCard title="Recruiter Notes">
                                <div className="space-y-3">
                                    <textarea
                                        value={noteText}
                                        onChange={e => setNoteText(e.target.value)}
                                        rows={8}
                                        placeholder="Add internal recruiter notes, observations, follow-up reminders…"
                                        className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[13px] text-[#1E293B] placeholder-[#CBD5E1] resize-none outline-none focus:border-[#93C5FD] focus:ring-2 focus:ring-[#DBEAFE] transition"
                                    />
                                    <button onClick={saveNote} disabled={savingNote || !noteText.trim()}
                                        className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1D4ED8] transition disabled:opacity-40">
                                        {savingNote
                                            ? <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving…</>
                                            : noteSaved
                                                ? <><Icon d={icons.check} size={14} />Saved!</>
                                                : <><Icon d={icons.note} size={14} />Save Notes</>
                                        }
                                    </button>
                                </div>
                            </CeipalCard>

                            <CeipalCard title="Client Feedback">
                                {submission.clientFeedback ? (
                                    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                                        <p className="text-[13px] text-[#475569] leading-relaxed whitespace-pre-wrap">
                                            {submission.clientFeedback}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                                        <Icon d={icons.building} size={24} className="text-[#CBD5E1]" />
                                        <p className="text-[12px] text-[#94A3B8]">No client feedback recorded yet.</p>
                                    </div>
                                )}
                            </CeipalCard>
                        </div>
                    )}

                </div>

                {/* ── RIGHT SIDEBAR ── */}
                <div className="w-[260px] shrink-0 border-l border-[#E2E8F0] bg-white flex flex-col">

                    {/* Quick Actions */}
                    <div className="border-b border-[#F1F5F9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Quick Actions</p>
                        <div className="space-y-2">
                            {allowed.length > 0 && (
                                <button onClick={() => setShowStatus(true)}
                                    className="w-full flex items-center gap-2.5 rounded-lg bg-[#2563EB] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1D4ED8] transition shadow-sm">
                                    <Icon d={icons.arrow} size={15} />
                                    Move Status
                                </button>
                            )}
                            <button onClick={() => setShowSchedule(true)}
                                className="w-full flex items-center gap-2.5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                                <Icon d={icons.calendar} size={15} />
                                Schedule Interview
                            </button>
                            <button onClick={() => navigate(`${roleBase}/candidates/${candidateId}`)}
                                className="w-full flex items-center gap-2.5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                                <Icon d={icons.user} size={15} />
                                View Candidate
                            </button>
                            <button onClick={() => navigate(`${roleBase}/jobs/${jobId}`)}
                                className="w-full flex items-center gap-2.5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                                <Icon d={icons.brief} size={15} />
                                View Job
                            </button>
                        </div>
                    </div>

                    {/* Current Status */}
                    <div className="border-b border-[#F1F5F9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Submission Status</p>
                        <div className="mb-2">
                            <StatusBadge status={submission.status} />
                        </div>
                        {/* next possible statuses */}
                        {allowed.length > 0 && (
                            <div className="mt-3">
                                <p className="text-[10px] text-[#94A3B8] mb-1.5 font-medium">Can move to</p>
                                <div className="flex flex-wrap gap-1">
                                    {allowed.slice(0, 4).map((s) => {
                                        const st = getStatusStyle(s);
                                        return (
                                            <button key={s} onClick={() => setShowStatus(true)}
                                                className="rounded-full border px-2 py-0.5 text-[10px] font-semibold transition hover:opacity-80"
                                                style={{ background: st.bg, color: st.text, borderColor: st.border || st.dot + "55" }}>
                                                {s}
                                            </button>
                                        );
                                    })}
                                    {allowed.length > 4 && (
                                        <button onClick={() => setShowStatus(true)}
                                            className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition">
                                            +{allowed.length - 4} more
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        {allowed.length === 0 && (
                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
                                <Icon d={icons.lock} size={12} />
                                Terminal status
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="border-b border-[#F1F5F9] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Quick Info</p>
                        <div className="space-y-2.5">
                            <SidebarKV label="Days Open"   value={`${daysInPipe} days`} />
                            <SidebarKV label="Stage"       value={PIPELINE_STAGES[stageIndex]?.label || "—"} />
                            <SidebarKV label="Interviews"  value={`${interviews.length} total`} />
                            <SidebarKV label="Pending"     value={`${pendingInterviews.length}`} />
                            <SidebarKV label="Completed"   value={`${completedInterviews.length}`} />
                            <SidebarKV label="Submitted"   value={fmtDate(submission.submittedDate || submission.createdAt)} />
                        </div>
                    </div>

                    {/* Candidate Contact */}
                    <div className="p-4 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Details</p>
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                                <Icon d={icons.user} size={13} className="text-[#94A3B8] shrink-0" />
                                <span className="truncate">{submission.candidateName || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                                <Icon d={icons.brief} size={13} className="text-[#94A3B8] shrink-0" />
                                <span className="truncate">{submission.jobTitle || "—"}</span>
                            </div>
                            {submission.clientName && (
                                <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                                    <Icon d={icons.building} size={13} className="text-[#94A3B8] shrink-0" />
                                    <span className="truncate">{submission.clientName}</span>
                                </div>
                            )}
                            {lastUpdate?.note && lastUpdate.note !== "Submission created" && (
                                <div className="mt-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8] mb-1">Last Note</p>
                                    <p className="text-[11px] text-[#475569] italic leading-relaxed">{lastUpdate.note}</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* ═══════════════ MODALS ═══════════════ */}
            {showStatus && (
                <ChangeStatusModal
                    submission={submission}
                    onClose={() => setShowStatus(false)}
                    onSuccess={async (updated) => { setSubmission(updated); setShowStatus(false); await load(); }}
                />
            )}
            {showFeedback && (
                <InterviewFeedbackModal
                    interview={showFeedback}
                    onClose={() => setShowFeedback(null)}
                    onSuccess={async () => { setShowFeedback(null); await load(); }}
                />
            )}
            {showSchedule && (
                <ScheduleInterviewModal
                    candidate={{
                        id: candidateId,
                        candidateName: submission.candidateName,
                        firstName: (submission.candidateName || "").split(" ")[0],
                        lastName:  (submission.candidateName || "").split(" ").slice(1).join(" "),
                    }}
                    preselectedJob={{ id: jobId, title: submission.jobTitle, client: submission.clientName }}
                    onClose={() => setShowSchedule(false)}
                    onSuccess={async () => { setShowSchedule(false); await load(); }}
                />
            )}
        </div>
    );
};

export default SubmissionDetail;