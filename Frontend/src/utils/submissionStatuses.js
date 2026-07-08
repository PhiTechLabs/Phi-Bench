// ─── SUBMISSION STATUS CONFIG ─────────────────────────────────────────────────
// Mirrors Backend/models/Submission.js — single source of truth for UI

export const SUBMISSION_STATUS_TRANSITIONS = {
    "For Validation":       ["Internal Hold", "Internal Reject", "Need More Info", "Submitted To Client"],
    "Internal Hold":        ["For Validation", "Submitted To Client"],
    "Internal Reject":      ["For Validation"],
    "Need More Info":       ["Internal Hold", "For Validation", "Internal Reject", "Submitted To Client"],
    "Submitted To Client":  ["Duplicate", "Hold by Client", "Screen Reject", "Position Closed", "L1 Schedule Pending"],
    "Duplicate":            ["For Validation"],
    "Hold by Client":       ["Submitted To Client", "Screen Reject", "Position Closed", "Duplicate", "L1 Schedule Pending", "L2 Schedule Pending", "L3 Schedule Pending", "L4 Schedule Pending"],
    "Screen Reject":        ["For Validation"],
    "Position Closed":      ["Screen Reject", "Submitted To Client", "Duplicate", "L1 Schedule Pending"],
    "L1 Schedule Pending":  ["L1 Backout", "Hold by Client"],
    "L1 Scheduled":         [],
    "L1 Feedback Pending":  ["L1 Rejected", "L1 Backout", "L2 Schedule Pending", "Final Select", "Hold by Client"],
    "L1 Rescheduled":       ["L1 Schedule Pending", "L1 Feedback Pending"],
    "L1 Rejected":          ["Submitted To Client"],
    "L1 Backout":           ["L1 Schedule Pending", "Hold by Client"],
    "L2 Schedule Pending":  ["L2 Backout", "Hold by Client"],
    "L2 Scheduled":         [],
    "L2 Feedback Pending":  ["L2 Rejected", "L2 Backout", "L3 Schedule Pending", "Final Select", "Hold by Client"],
    "L2 Rescheduled":       ["L2 Schedule Pending", "L2 Feedback Pending"],
    "L2 Rejected":          ["Submitted To Client"],
    "L2 Backout":           ["L2 Schedule Pending", "Hold by Client"],
    "L3 Schedule Pending":  ["L3 Backout", "Hold by Client"],
    "L3 Scheduled":         [],
    "L3 Feedback Pending":  ["L3 Rejected", "L3 Backout", "L4 Schedule Pending", "Final Select", "Hold by Client"],
    "L3 Rescheduled":       ["L3 Schedule Pending", "L3 Feedback Pending"],
    "L3 Rejected":          ["Submitted To Client"],
    "L3 Backout":           ["L3 Schedule Pending", "Hold by Client"],
    "L4 Schedule Pending":  ["L4 Backout", "Hold by Client"],
    "L4 Scheduled":         [],
    "L4 Feedback Pending":  ["L4 Rejected", "L4 Backout", "Final Select", "Hold by Client"],
    "L4 Rescheduled":       ["L4 Schedule Pending", "L4 Feedback Pending"],
    "L4 Rejected":          ["Submitted To Client"],
    "L4 Backout":           ["L4 Schedule Pending", "Hold by Client"],
    "Final Select":         ["HR Discussion", "Final Backout"],
    "HR Discussion":        ["Offer Sent", "Final Backout"],
    "Final Backout":        ["Final Select"],
    "Offer Sent":           ["Offer Accepted", "BGV Failed", "Offer Rejected", "Offer Withdrawn", "HR Discussion"],
    "Offer Accepted":       ["Joined", "BGV Failed", "Joining Backout"],
    "Joined":               ["Absconded", "Replacement Term Ended", "Project Completed", "Project Ended"],
    "BGV Failed":           [],
    "Offer Rejected":       [],
    "Offer Withdrawn":      [],
    "Joining Backout":      [],
    "Absconded":            [],
    "Replacement Term Ended": [],
    "Project Completed":    [],
    "Project Ended":        [],
};

// ─── STATUS BADGE COLORS ──────────────────────────────────────────────────────
export const STATUS_STYLE = {
    // Blue – awaiting action
    "For Validation":       { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6", border: "#BFDBFE" },
    "Need More Info":       { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316", border: "#FED7AA" },
    "Internal Hold":        { bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B", border: "#FDE68A" },

    // Orange – submitted to client
    "Submitted To Client":  { bg: "#FFF7ED", text: "#9A3412", dot: "#EA580C", border: "#FDBA74" },

    // Gray – neutral/closed
    "Internal Reject":      { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444", border: "#FECACA" },
    "Duplicate":            { bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF", border: "#E5E7EB" },
    "Hold by Client":       { bg: "#FFFBEB", text: "#B45309", dot: "#F59E0B", border: "#FDE68A" },
    "Screen Reject":        { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444", border: "#FECACA" },
    "Position Closed":      { bg: "#F9FAFB", text: "#4B5563", dot: "#6B7280", border: "#D1D5DB" },

    // Purple – interview stages
    "L1 Schedule Pending":  { bg: "#F5F3FF", text: "#5B21B6", dot: "#7C3AED", border: "#DDD6FE" },
    "L1 Scheduled":         { bg: "#EDE9FE", text: "#4C1D95", dot: "#7C3AED", border: "#C4B5FD" },
    "L1 Feedback Pending":  { bg: "#FDF4FF", text: "#701A75", dot: "#A21CAF", border: "#E9D5FF" },
    "L1 Rescheduled":       { bg: "#FDF4FF", text: "#6B21A8", dot: "#9333EA", border: "#E9D5FF" },
    "L1 Rejected":          { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444", border: "#FECACA" },
    "L1 Backout":           { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316", border: "#FED7AA" },

    "L2 Schedule Pending":  { bg: "#F5F3FF", text: "#5B21B6", dot: "#7C3AED", border: "#DDD6FE" },
    "L2 Scheduled":         { bg: "#EDE9FE", text: "#4C1D95", dot: "#7C3AED", border: "#C4B5FD" },
    "L2 Feedback Pending":  { bg: "#FDF4FF", text: "#701A75", dot: "#A21CAF", border: "#E9D5FF" },
    "L2 Rescheduled":       { bg: "#FDF4FF", text: "#6B21A8", dot: "#9333EA", border: "#E9D5FF" },
    "L2 Rejected":          { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444", border: "#FECACA" },
    "L2 Backout":           { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316", border: "#FED7AA" },

    "L3 Schedule Pending":  { bg: "#F5F3FF", text: "#5B21B6", dot: "#7C3AED", border: "#DDD6FE" },
    "L3 Scheduled":         { bg: "#EDE9FE", text: "#4C1D95", dot: "#7C3AED", border: "#C4B5FD" },
    "L3 Feedback Pending":  { bg: "#FDF4FF", text: "#701A75", dot: "#A21CAF", border: "#E9D5FF" },
    "L3 Rescheduled":       { bg: "#FDF4FF", text: "#6B21A8", dot: "#9333EA", border: "#E9D5FF" },
    "L3 Rejected":          { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444", border: "#FECACA" },
    "L3 Backout":           { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316", border: "#FED7AA" },

    "L4 Schedule Pending":  { bg: "#F5F3FF", text: "#5B21B6", dot: "#7C3AED", border: "#DDD6FE" },
    "L4 Scheduled":         { bg: "#EDE9FE", text: "#4C1D95", dot: "#7C3AED", border: "#C4B5FD" },
    "L4 Feedback Pending":  { bg: "#FDF4FF", text: "#701A75", dot: "#A21CAF", border: "#E9D5FF" },
    "L4 Rescheduled":       { bg: "#FDF4FF", text: "#6B21A8", dot: "#9333EA", border: "#E9D5FF" },
    "L4 Rejected":          { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444", border: "#FECACA" },
    "L4 Backout":           { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316", border: "#FED7AA" },

    // Green – positive outcomes
    "Final Select":         { bg: "#ECFDF5", text: "#065F46", dot: "#10B981", border: "#A7F3D0" },
    "HR Discussion":        { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E", border: "#BBF7D0" },
    "Offer Sent":           { bg: "#F0FDF4", text: "#166534", dot: "#16A34A", border: "#86EFAC" },
    "Offer Accepted":       { bg: "#ECFDF5", text: "#065F46", dot: "#10B981", border: "#6EE7B7" },
    "Joined":               { bg: "#D1FAE5", text: "#064E3B", dot: "#059669", border: "#34D399" },
    "Project Completed":    { bg: "#ECFDF5", text: "#065F46", dot: "#10B981", border: "#A7F3D0" },
    "Replacement Term Ended": { bg: "#F0FDF4", text: "#166534", dot: "#22C55E", border: "#BBF7D0" },

    // Red – negative outcomes
    "Final Backout":        { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316", border: "#FED7AA" },
    "BGV Failed":           { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444", border: "#FECACA" },
    "Offer Rejected":       { bg: "#FEF2F2", text: "#7F1D1D", dot: "#DC2626", border: "#FECACA" },
    "Offer Withdrawn":      { bg: "#F9FAFB", text: "#374151", dot: "#6B7280", border: "#D1D5DB" },
    "Joining Backout":      { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316", border: "#FED7AA" },
    "Absconded":            { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444", border: "#FECACA" },
    "Project Ended":        { bg: "#F9FAFB", text: "#4B5563", dot: "#6B7280", border: "#D1D5DB" },
};

const DEFAULT_STYLE = { bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF", border: "#E5E7EB" };

export const getStatusStyle = (status) => STATUS_STYLE[status] || DEFAULT_STYLE;

export const getAllowedTransitions = (currentStatus) =>
    SUBMISSION_STATUS_TRANSITIONS[currentStatus] || [];

// ─── INTERVIEW OUTCOME STYLES ─────────────────────────────────────────────────
export const INTERVIEW_OUTCOME_STYLES = {
    "Done":               { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
    "Cleared":            { bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
    "Selected":           { bg: "#D1FAE5", text: "#064E3B", dot: "#059669" },
    "Rejected":           { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
    "Backout":            { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
    "No Show":            { bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF" },
    "Client Reschedule":  { bg: "#FFFBEB", text: "#B45309", dot: "#F59E0B" },
    "Candidate Reschedule": { bg: "#FFFBEB", text: "#B45309", dot: "#F59E0B" },
};

export const INTERVIEW_STATUS_STYLES = {
    "Scheduled":   { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
    "Rescheduled": { bg: "#FFFBEB", text: "#B45309", dot: "#F59E0B" },
    "Completed":   { bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
    "Cancelled":   { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
    "No Show":     { bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF" },
};

// ─── TERMINAL STATUS HELPERS ──────────────────────────────────────────────────
// A submission is "terminal" when it has definitively ended with no path
// forward to an interview — i.e., rejected, withdrawn, closed, or placed.
// Statuses with empty transition arrays in SUBMISSION_STATUS_TRANSITIONS are
// terminal; we also include a few that have limited re-entry paths but are
// functionally dead ends for interview scheduling purposes.
const TERMINAL_STATUSES = new Set([
    "Internal Reject",
    "Screen Reject",
    "Duplicate",
    "L1 Rejected",
    "L2 Rejected",
    "L3 Rejected",
    "L4 Rejected",
    "Offer Rejected",
    "Offer Withdrawn",
    "Final Backout",
    "BGV Failed",
    "Joining Backout",
    "Absconded",
    "Replacement Term Ended",
    "Project Completed",
    "Project Ended",
    "Joined",       // already placed — no new interview needed
    "Position Closed",
]);

// True when a submission's status means it can no longer proceed to interview.
export const isTerminalStatus = (status) => TERMINAL_STATUSES.has(status);

// ─── INTERVIEW SCHEDULING WINDOW ─────────────────────────────────────────────
// Schedule Interview is only valid between "Submitted To Client" and
// "Final Select" (exclusive). Before submission to client = no interview yet.
// At/after Final Select = interview process is over.
const SCHEDULE_INTERVIEW_STATUSES = new Set([
    "Submitted To Client",
    "Hold by Client",
    "L1 Schedule Pending", "L1 Backout",
    "L2 Schedule Pending", "L2 Backout",
    "L3 Schedule Pending", "L3 Backout",
    "L4 Schedule Pending", "L4 Backout",
    "L1 Feedback Pending", "L2 Feedback Pending",
    "L3 Feedback Pending", "L4 Feedback Pending",
    "L1 Rescheduled", "L2 Rescheduled",
    "L3 Rescheduled", "L4 Rescheduled",
]);

export const canScheduleInterview = (status) =>
    SCHEDULE_INTERVIEW_STATUSES.has(status);

// ─── Lx SCHEDULED DETECTION ──────────────────────────────────────────────────
// When a submission is at Lx Scheduled, the sidebar should show a
// "Give Feedback" button instead of the (empty) "Move To" list.
export const isScheduledStatus = (status) =>
    status === "L1 Scheduled" ||
    status === "L2 Scheduled" ||
    status === "L3 Scheduled" ||
    status === "L4 Scheduled";

// ─── DERIVE INTERVIEW ROUND FROM STATUS ──────────────────────────────────────
// When opening ScheduleInterviewModal from a submission at "L2 Schedule Pending",
// the round should be pre-set to "L2", not shown as all options.
export const getRoundFromStatus = (status) => {
    if (!status) return null;
    const match = status.match(/^(L[1-4]) Schedule Pending$/);
    return match ? match[1] : null;
};

// True when a candidate has at least one submission that is still in-flight
// (not rejected/closed/placed). Used in CandidateDetails to gate the
// "Schedule Interview" button — a candidate with no active submission should
// not be schedulable for interview.
export const hasActiveSubmission = (submissions = []) =>
    submissions.some((s) => !isTerminalStatus(s.status));