import React, { useState } from "react";
import DataTable from "../DataTable/DataTable";
import { getStatusStyle, INTERVIEW_STATUS_STYLES, INTERVIEW_OUTCOME_STYLES } from "../../utils/submissionStatuses";

// ─── SHARED INLINE STATUS BADGE ──────────────────────────────────────────────
const StatusPill = ({ status, styleMap }) => {
    const s = styleMap
        ? (styleMap[status] || { bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF", border: "#E5E7EB" })
        : getStatusStyle(status);
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap"
            style={{ background: s.bg, color: s.text, borderColor: s.border || s.dot + "44" }}>
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
            {status || "—"}
        </span>
    );
};

// ─── ROUND BADGE ─────────────────────────────────────────────────────────────
const RoundBadge = ({ round }) => {
    if (!round) return <span className="text-[#CBD5E1]">—</span>;
    return (
        <span className="inline-flex items-center rounded-md bg-[#EDE9FE] border border-[#C4B5FD] px-2 py-0.5 text-[10.5px] font-bold text-[#5B21B6]">
            {round}
        </span>
    );
};

// ─── CHANGE STATUS BUTTON ─────────────────────────────────────────────────────
const ChangeBtn = ({ onClick }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 text-[10.5px] font-semibold text-[#2563EB] hover:bg-[#DBEAFE] transition whitespace-nowrap"
    >
        Change
    </button>
);

// ─── FEEDBACK BUTTON ─────────────────────────────────────────────────────────
const FeedbackBtn = ({ onClick }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="rounded-md border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[10.5px] font-semibold text-[#16A34A] hover:bg-[#DCFCE7] transition whitespace-nowrap"
    >
        Feedback
    </button>
);

// ─── FORMAT DATE ──────────────────────────────────────────────────────────────
const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
};

const fmtDateFull = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

// ─── INLINE STATUS TIMELINE ───────────────────────────────────────────────────
// Compact version of the full timeline in SubmissionDetail.jsx — shown inline
// on the Candidate Details and Job Details submission tabs when a recruiter
// expands a submission card to see its history.
const StatusTimeline = ({ history = [] }) => {
    if (!history.length) {
        return <p className="py-3 text-center text-[12px] text-[#94A3B8]">No history recorded yet.</p>;
    }

    return (
        <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[#E2E8F0]" />
            {[...history].reverse().map((h, i, arr) => {
                const st = getStatusStyle(h.status);
                const isLatest = i === 0;
                return (
                    <div key={i} className="relative flex items-start gap-3 py-2.5">
                        {/* Dot */}
                        <div className="relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-2"
                            style={{
                                background:  isLatest ? st.bg   : "#F8FAFC",
                                borderColor: isLatest ? st.dot  : "#E2E8F0",
                            }}>
                            <span className="h-2 w-2 rounded-full"
                                style={{ background: isLatest ? st.dot : "#CBD5E1" }} />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <StatusPill status={h.status} />
                                    {isLatest && (
                                        <span className="rounded-full bg-[#1E293B] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide">
                                            Current
                                        </span>
                                    )}
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[11px] text-[#475569] font-medium">{fmtDateFull(h.changedAt)}</p>
                                    {h.changedBy?.username && (
                                        <p className="text-[10px] text-[#94A3B8] mt-0.5">by {h.changedBy.username}</p>
                                    )}
                                </div>
                            </div>
                            {h.note && h.note !== "Submission created" && (
                                <p className="mt-1 text-[11px] italic text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2 py-1">
                                    {h.note}
                                </p>
                            )}
                            {i === arr.length - 1 && (
                                <p className="mt-0.5 text-[10.5px] text-[#94A3B8]">Submission created</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ─── SUBMISSION CARD ──────────────────────────────────────────────────────────
// A single expandable card showing submission summary + history toggle.
// Used in SubmissionsTable when statusHistory data is available.
const SubmissionCard = ({ sub, context, onChangeStatus, onRowClick }) => {
    const [historyOpen, setHistoryOpen] = useState(false);
    const historyCount = sub.statusHistory?.length || 0;

    return (
        <div className="rounded-xl border border-[#E8E6E0] bg-white overflow-hidden transition-shadow hover:shadow-sm">
            {/* Card header — always visible */}
            <div
                className="flex items-start justify-between gap-3 px-4 py-3 cursor-pointer"
                onClick={() => onRowClick?.(sub)}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold text-[#1E293B] truncate">
                            {context === "candidate" ? sub.jobTitle : sub.candidateName}
                        </p>
                        {sub.clientName && context === "candidate" && (
                            <span className="text-[11.5px] text-[#94A3B8]">· {sub.clientName}</span>
                        )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <StatusPill status={sub.status} />
                        {onChangeStatus && (
                            <ChangeBtn onClick={() => onChangeStatus(sub)} />
                        )}
                        <span className="text-[11px] text-[#94A3B8]">
                            Submitted {fmtDate(sub.submittedDate)}
                        </span>
                    </div>
                </div>

                {/* History toggle button */}
                <button
                    onClick={(e) => { e.stopPropagation(); setHistoryOpen((s) => !s); }}
                    className={`shrink-0 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                        historyOpen
                            ? "bg-[#F0F5FF] border-[#BFDBFE] text-[#2563EB]"
                            : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-[#BFDBFE] hover:text-[#2563EB]"
                    }`}
                >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points={historyOpen ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                    </svg>
                    History
                    {historyCount > 0 && (
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                            historyOpen ? "bg-[#2563EB] text-white" : "bg-[#E2E8F0] text-[#64748B]"
                        }`}>
                            {historyCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Expandable history panel */}
            {historyOpen && (
                <div className="border-t border-[#F1F5F9] bg-[#FAFBFC] px-4 pt-3 pb-4">
                    <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-widest text-[#94A3B8]">
                        Status History · {historyCount} {historyCount === 1 ? "change" : "changes"}
                    </p>
                    <StatusTimeline history={sub.statusHistory || []} />
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SUBMISSIONS TABLE
// Uses card layout (not DataTable) so each submission can expand its history.
// ═══════════════════════════════════════════════════════════════════════════════
export const SubmissionsTable = ({ submissions = [], onChangeStatus, onRowClick, context = "candidate" }) => {
    if (!submissions.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F4F0] text-[#9B9890]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                </div>
                <p className="text-[14px] font-semibold text-[#1C1B18]">No submissions yet</p>
                <p className="mt-1 text-[12.5px] text-[#9B9890]">
                    {context === "candidate"
                        ? "This candidate hasn't been submitted to any jobs."
                        : "No candidates have been submitted to this job."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2.5">
            {submissions.map((sub) => (
                <SubmissionCard
                    key={sub.id || sub._id}
                    sub={{ ...sub, id: sub.id || sub._id }}
                    context={context}
                    onChangeStatus={onChangeStatus}
                    onRowClick={onRowClick}
                />
            ))}
        </div>
    );
};


// ═══════════════════════════════════════════════════════════════════════════════
// INTERVIEWS TABLE
// ═══════════════════════════════════════════════════════════════════════════════
export const InterviewsTable = ({ interviews = [], onFeedback, onRowClick, context = "candidate" }) => {

    const rows = interviews.map((iv) => ({ ...iv, id: iv.id || iv._id }));

    const columns = [
        {
            key:            "sno",
            label:          "#",
            type:           "sno",
            width:          48,
            fixed:          true,
            sortable:       false,
            removable:      false,
            defaultVisible: true,
        },

        ...(context === "candidate" ? [{
            key:            "jobTitle",
            label:          "Job Title",
            type:           "text",
            width:          180,
            bold:           true,
            link:           true,
            sortable:       true,
            sortType:       "string",
            searchable:     true,
            filterable:     false,
            defaultVisible: true,
            removable:      false,
        }] : [{
            key:            "candidateName",
            label:          "Candidate",
            type:           "text",
            width:          180,
            bold:           true,
            link:           true,
            avatar:         true,
            sortable:       true,
            sortType:       "string",
            searchable:     true,
            filterable:     false,
            defaultVisible: true,
            removable:      false,
        }]),

        {
            key:            "interviewRound",
            label:          "Round",
            width:          80,
            sortable:       true,
            sortType:       "string",
            filterable:     true,
            defaultVisible: true,
            removable:      false,
            render:         (row) => <RoundBadge round={row.interviewRound} />,
        },

        {
            key:            "interviewType",
            label:          "Type",
            type:           "text",
            width:          120,
            sortable:       true,
            sortType:       "string",
            filterable:     true,
            defaultVisible: true,
        },

        {
            key:            "scheduledDate",
            label:          "Scheduled",
            width:          130,
            sortable:       true,
            sortType:       "date",
            defaultVisible: true,
            removable:      false,
            render: (row) => (
                <span className="text-[11.5px]">
                    {fmtDate(row.scheduledDate)}
                    {row.scheduledTime && (
                        <span className="ml-1 text-[#94A3B8]">@ {row.scheduledTime}</span>
                    )}
                </span>
            ),
        },

        {
            key:            "duration",
            label:          "Duration",
            width:          80,
            sortable:       true,
            sortType:       "number",
            defaultVisible: false,
            render:         (row) => row.duration ? <span className="text-[11.5px]">{row.duration} min</span> : <span className="text-[#CBD5E1]">—</span>,
        },

        {
            key:            "status",
            label:          "Status",
            width:          130,
            sortable:       true,
            sortType:       "string",
            filterable:     true,
            defaultVisible: true,
            removable:      false,
            render:         (row) => <StatusPill status={row.status} styleMap={INTERVIEW_STATUS_STYLES} />,
        },

        {
            key:            "outcome",
            label:          "Outcome",
            width:          160,
            sortable:       true,
            sortType:       "string",
            filterable:     true,
            defaultVisible: true,
            render: (row) => {
                const canFeedback = row.status === "Scheduled" || row.status === "Rescheduled";
                if (canFeedback && onFeedback) {
                    return (
                        <div className="flex items-center gap-2">
                            {row.outcome
                                ? <StatusPill status={row.outcome} styleMap={INTERVIEW_OUTCOME_STYLES} />
                                : <span className="text-[10.5px] text-[#94A3B8]">Pending</span>
                            }
                            <FeedbackBtn onClick={() => onFeedback(row)} />
                        </div>
                    );
                }
                return row.outcome
                    ? <StatusPill status={row.outcome} styleMap={INTERVIEW_OUTCOME_STYLES} />
                    : <span className="text-[#CBD5E1]">—</span>;
            },
        },

        {
            key:            "rating",
            label:          "Rating",
            width:          90,
            sortable:       true,
            sortType:       "number",
            defaultVisible: false,
            render: (row) => row.rating
                ? <span className="text-[12px] text-yellow-500">{"★".repeat(row.rating)}{"☆".repeat(5 - row.rating)}</span>
                : <span className="text-[#CBD5E1]">—</span>,
        },

        {
            key:            "interviewers",
            label:          "Interviewers",
            width:          160,
            sortable:       false,
            defaultVisible: false,
            render: (row) => {
                const list = Array.isArray(row.interviewers) ? row.interviewers : [];
                if (!list.length) return <span className="text-[#CBD5E1]">—</span>;
                return (
                    <span className="truncate text-[11.5px]">{list.join(", ")}</span>
                );
            },
        },

        {
            key:            "feedback",
            label:          "Feedback",
            type:           "text",
            width:          220,
            sortable:       false,
            defaultVisible: false,
        },

        {
            key:            "clientName",
            label:          "Client",
            type:           "text",
            width:          140,
            sortable:       true,
            sortType:       "string",
            filterable:     true,
            defaultVisible: false,
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={rows}
            storageKey={`interviews-tab-${context}`}
            onRowClick={onRowClick}
            searchPlaceholder="Search interviews…"
            emptyState={{
                title: "No interviews yet",
                hint:  context === "candidate"
                    ? "No interviews have been scheduled for this candidate."
                    : "No interviews have been scheduled for this job.",
            }}
        />
    );
};