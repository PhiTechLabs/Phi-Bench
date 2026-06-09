import React from "react";
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

// ═══════════════════════════════════════════════════════════════════════════════
// SUBMISSIONS TABLE
// ═══════════════════════════════════════════════════════════════════════════════
export const SubmissionsTable = ({ submissions = [], onChangeStatus, onRowClick, context = "candidate" }) => {

    // Normalise rows — ensure id field
    const rows = submissions.map((s) => ({ ...s, id: s.id || s._id }));

    // ── Column definitions ────────────────────────────────────────────────────
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

        // Show job column on candidate detail page, candidate column on job detail page
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
            key:            "clientName",
            label:          "Client",
            type:           "text",
            width:          150,
            sortable:       true,
            sortType:       "string",
            searchable:     true,
            filterable:     true,
            defaultVisible: true,
        },

        {
            key:            "status",
            label:          "Status",
            width:          190,
            sortable:       true,
            sortType:       "string",
            filterable:     true,
            defaultVisible: true,
            removable:      false,
            render: (row) => (
                <div className="flex items-center gap-2">
                    <StatusPill status={row.status} />
                    {onChangeStatus && (
                        <ChangeBtn onClick={() => onChangeStatus(row)} />
                    )}
                </div>
            ),
        },

        {
            key:            "submittedDate",
            label:          "Submitted",
            type:           "date",
            width:          110,
            sortable:       true,
            sortType:       "date",
            defaultVisible: true,
        },

        {
            key:            "recruiterNotes",
            label:          "Notes",
            type:           "text",
            width:          200,
            sortable:       false,
            defaultVisible: false,
        },

        {
            key:            "clientFeedback",
            label:          "Client Feedback",
            type:           "text",
            width:          200,
            sortable:       false,
            defaultVisible: false,
        },

        {
            key:            "createdAt",
            label:          "Created",
            type:           "date",
            width:          110,
            sortable:       true,
            sortType:       "date",
            defaultVisible: false,
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={rows}
            storageKey={`submissions-tab-${context}`}
            onRowClick={onRowClick}
            searchPlaceholder="Search submissions…"
            emptyState={{
                title: "No submissions yet",
                hint:  context === "candidate"
                    ? "This candidate hasn't been submitted to any jobs."
                    : "No candidates have been submitted to this job.",
            }}
        />
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