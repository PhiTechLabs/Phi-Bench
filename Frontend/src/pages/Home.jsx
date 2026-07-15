import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { listSubmissions }  from "../api/submissionsApi";
import { getStatusStyle, INTERVIEW_STATUS_STYLES } from "../utils/submissionStatuses";
import PermissionGuard from "../components/PermissionGuard";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const POLL_MS = 60_000;
import { listJobs }       from "../api/jobsApi";
import { listCandidates } from "../api/candidatesApi";
import { getAllClients }  from "../api/clientApi";
import {
  listInterviews,
} from "../api/interviewsApi";
import usePermissions from "../hooks/usePermission";

const SUBMISSION_PIPELINE = [
  { key: "For Validation",      label: "Validation",   color: "#3B82F6", bg: "#EFF6FF" },
  { key: "Submitted To Client", label: "Submitted",    color: "#EA580C", bg: "#FFF7ED" },
  { key: "interview",           label: "Interviewing", color: "#7C3AED", bg: "#F5F3FF" },
  { key: "Final Select",        label: "Final Select", color: "#10B981", bg: "#ECFDF5" },
  { key: "Offer Sent",          label: "Offer Sent",   color: "#F59E0B", bg: "#FFFBEB" },
  { key: "Joined",              label: "Joined",       color: "#059669", bg: "#D1FAE5" },
];

const BENCH_AGING_BANDS = [
  { label: "0–15 days",  min: 0,   max: 15,  color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  { label: "16–30 days", min: 16,  max: 30,  color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { label: "31–60 days", min: 31,  max: 60,  color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { label: "60+ days",   min: 61,  max: Infinity, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
];

const ACTION_NEEDED_STATUSES = [
  "For Validation", "Need More Info",
  "L1 Feedback Pending", "L2 Feedback Pending",
  "L3 Feedback Pending", "L4 Feedback Pending",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const daysAgo = (d) => {
  if (!d) return 0;
  const ms = Date.now() - new Date(d).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
};

const countWithin = (arr, field, days) => {
  const cutoff = Date.now() - days * 86400000;
  return arr.filter((i) => {
    const t = new Date(i[field]).getTime();
    return !isNaN(t) && t >= cutoff;
  }).length;
};

const deltaPct = (curr, prev) => {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
};

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
};

const fmtTime = (d, t) => {
  if (!d) return "—";
  const base = new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  return t ? `${base} · ${t}` : base;
};

const initials = (n = "") =>
  n.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

const isToday = (d) => {
  if (!d) return false;
  const now = new Date();
  const dt  = new Date(d);
  return dt.getDate() === now.getDate() &&
        dt.getMonth() === now.getMonth() &&
        dt.getFullYear() === now.getFullYear();
};

const isThisWeek = (d) => {
  if (!d) return false;
  const cutoff = Date.now() + 7 * 86400000;
  const dt = new Date(d).getTime();
  return dt >= Date.now() && dt <= cutoff;
};

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
);
const I = {
  brief:    "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  users:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  handshake:"M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
  trending: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  alert:    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  clock:    "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  check:    "M5 13l4 4L19 7",
  arrow:    "M5 12h14M12 5l7 7-7 7",
  refresh:  "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  bench:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  up:       "M18 15l-6-6-6 6",
  down:     "M6 9l6 6 6-6",
  dot:      "M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0",
  submit:   "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
};

// ─── MINI AVATAR ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  ["#DBEAFE","#1D4ED8"],["#FCE7F3","#9D174D"],["#D1FAE5","#065F46"],
  ["#FEF3C7","#92400E"],["#EDE9FE","#5B21B6"],["#FFEDD5","#9A3412"],
];
const Avatar = ({ name, size = 30 }) => {
  const [bg, text] = AVATAR_COLORS[
    (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  ];
  return (
    <div className="shrink-0 flex items-center justify-center rounded-full font-semibold"
      style={{ width: size, height: size, background: bg, color: text, fontSize: size * 0.35 }}>
      {initials(name)}
    </div>
  );
};

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
const SectionHeader = ({ title, sub, action, actionLabel }) => (
  <div className="mb-3 flex items-center justify-between">
    <div>
      <h2 className="text-[13.5px] font-bold text-[#1C1B18]">{title}</h2>
      {sub && <p className="text-[11px] text-[#9B9890] mt-0.5">{sub}</p>}
    </div>
    {action && (
      <button onClick={action}
        className="text-[11px] font-semibold text-[#1C4ED8] hover:underline flex items-center gap-1">
        {actionLabel || "View all"} <Ico d={I.arrow} size={11} />
      </button>
    )}
  </div>
);

// ─── EMPTY BLOCK ─────────────────────────────────────────────────────────────
const EmptyBlock = ({ msg }) => (
  <div className="py-8 text-center text-[12px] text-[#9B9890]">{msg}</div>
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const [refreshing, setRefreshing] = useState(false);

  // ── state ──
  const [jobs,        setJobs]        = useState([]);
  const [candidates,  setCandidates]  = useState([]);
  const [clients,     setClients]     = useState([]);
  const [interviews,  setInterviews]  = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mounted = useRef(true);

  const { can } = usePermissions();

  const fetchAll = useCallback(async () => {
  const [
    jobsData,
    candidatesData,
    clientsData,
    interviewsData,
    submissionsData,
  ] = await Promise.all([
    can("job", "view")
      ? listJobs().catch(() => [])
      : Promise.resolve([]),

    can("candidate", "view")
      ? listCandidates().catch(() => [])
      : Promise.resolve([]),

    can("clients", "view")
      ? getAllClients().catch(() => ({ clients: [] }))
      : Promise.resolve({ clients: [] }),

    can("interview", "view")
      ? listInterviews().catch(() => [])
      : Promise.resolve([]),

    can("submissions", "view")
      ? listSubmissions().catch(() => [])
      : Promise.resolve([]),
  ]);

  if (!mounted.current) return;

  setJobs(jobsData);
  setCandidates(candidatesData);
  setClients(
    Array.isArray(clientsData)
      ? clientsData
      : clientsData?.clients || clientsData?.data || []
  );
  setInterviews(interviewsData);
  setSubmissions(submissionsData);

  setLastUpdated(new Date());
  setLoading(false);
}, []);

  useEffect(() => {
    mounted.current = true;
    fetchAll();
    const t = setInterval(fetchAll, POLL_MS);
    return () => { mounted.current = false; clearInterval(t); };
  }, [fetchAll]);

  // ══════════════════════════════════════════════════════════════════════════
  // DERIVED DATA — all computed from real state, nothing hardcoded
  // ══════════════════════════════════════════════════════════════════════════

  // ── KPI cards ──
  const openJobs       = jobs.filter((j) => j.status === "Open").length;
  const onHoldJobs     = jobs.filter((j) => j.status === "On Hold").length;
  const filledJobs     = jobs.filter((j) => j.status === "Filled").length;
  const jobsThisWeek   = countWithin(jobs, "createdAt", 7);
  const jobsLastWeek   = countWithin(jobs, "createdAt", 14) - jobsThisWeek;

  const totalCandidates = candidates.length;
  const candThisWeek    = countWithin(candidates, "createdAt", 7);
  const candLastWeek    = countWithin(candidates, "createdAt", 14) - candThisWeek;

  const benchCandidates = candidates.filter((c) => c.onBench === true);
  const benchThisWeek   = benchCandidates.filter((c) => countWithin([c], "createdAt", 7) > 0).length;

  const totalSubmissions    = submissions.length;
  const subsThisWeek        = countWithin(submissions, "createdAt", 7);
  const subsLastWeek        = countWithin(submissions, "createdAt", 14) - subsThisWeek;

  const totalClients     = clients.length;
  const clientsThisWeek  = countWithin(clients, "createdAt", 7);
  const clientsLastWeek  = countWithin(clients, "createdAt", 14) - clientsThisWeek;

  // Offer conversion rate
  const placedSubs   = submissions.filter((s) => s.status === "Joined" || s.status === "Offer Accepted").length;
  const placementRate = totalSubmissions > 0 ? Math.round((placedSubs / totalSubmissions) * 100) : 0;

  // ── Submission pipeline counts ──
  const pipelineCounts = SUBMISSION_PIPELINE.map((stage) => {
    let count;
    if (stage.key === "interview") {
      count = submissions.filter((s) => s.status && (
        s.status.includes("Schedule") || s.status.includes("Scheduled") ||
        s.status.includes("Feedback") || s.status.includes("Rescheduled")
      )).length;
    } else {
      count = submissions.filter((s) => s.status === stage.key).length;
    }
    return { ...stage, count };
  });

  // ── Submissions needing action ──
  const actionNeeded = submissions
    .filter((s) => ACTION_NEEDED_STATUSES.includes(s.status))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(0, 8);

  // ── Bench aging ──
  const agingBands = BENCH_AGING_BANDS.map((band) => ({
    ...band,
    candidates: benchCandidates.filter((c) => {
      const days = daysAgo(c.createdAt);
      return days >= band.min && days <= band.max;
    }),
  }));

  // ── Today's interviews ──
  const todayInterviews = interviews
    .filter((iv) => isToday(iv.scheduledDate))
    .sort((a, b) => (a.scheduledTime || "").localeCompare(b.scheduledTime || ""));

  // ── Upcoming interviews (next 7 days, excluding today) ──
  const upcomingInterviews = interviews
    .filter((iv) => !isToday(iv.scheduledDate) && isThisWeek(iv.scheduledDate) && iv.status === "Scheduled")
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
    .slice(0, 6);

  // ── Urgent open jobs ──
  const urgentJobs = jobs
    .filter((j) => j.status === "Open")
    .map((j) => ({ ...j, daysOpen: daysAgo(j.dateOpened || j.createdAt) }))
    .sort((a, b) => b.daysOpen - a.daysOpen)
    .slice(0, 6);
  const maxDays = Math.max(1, ...urgentJobs.map((j) => j.daysOpen));

  // ── Client activity (jobs per client) ──
  const clientJobMap = {};
  jobs.forEach((j) => {
    if (!j.client) return;
    if (!clientJobMap[j.client]) clientJobMap[j.client] = { open: 0, filled: 0, total: 0 };
    clientJobMap[j.client].total++;
    if (j.status === "Open") clientJobMap[j.client].open++;
    if (j.status === "Filled") clientJobMap[j.client].filled++;
  });
  const topClients = Object.entries(clientJobMap)
    .sort((a, b) => b[1].open - a[1].open)
    .slice(0, 5);

  // ── Recent activity (last 5 submission status changes) ──
  const recentActivity = [...submissions]
    .filter((s) => s.statusHistory && s.statusHistory.length > 0)
    .sort((a, b) => {
      const aLast = a.statusHistory[a.statusHistory.length - 1]?.changedAt;
      const bLast = b.statusHistory[b.statusHistory.length - 1]?.changedAt;
      return new Date(bLast) - new Date(aLast);
    })
    .slice(0, 7)
    .map((s) => {
      const last = s.statusHistory[s.statusHistory.length - 1];
      return {
        id:            s.id,
        candidateName: s.candidateName,
        jobTitle:      s.jobTitle,
        status:        last?.status || s.status,
        changedAt:     last?.changedAt,
        note:          last?.note,
      };
    });

  // ── Bench stats ──
  const benchPct = totalCandidates > 0
    ? Math.round((benchCandidates.length / totalCandidates) * 100) : 0;
  const criticalBench = agingBands[3].candidates.length; // 60+ days
  const warningBench  = agingBands[2].candidates.length; // 31–60 days

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  if (loading) return (
    <div className="min-h-screen bg-[#EEF1F6] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="h-10 w-10 mx-auto animate-spin rounded-full border-4 border-[#E0DDD6] border-t-[#1C4ED8]" />
        <p className="text-[13px] text-[#9B9890]">Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#EEF1F6] font-sans">
      <div className="w-full px-4 py-5 sm:px-6 lg:px-8 2xl:px-12 space-y-5">

        {/* ══════════ HEADER ══════════ */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold text-[#1C1B18]">
              {greeting()}{user?.username ? `, ${user.username}` : ""}
            </h1>
            <p className="mt-0.5 text-[12.5px] text-[#9B9890]">
              Here's what's happening across your bench pipeline
              {lastUpdated && (
                <span className="ml-2 text-[11px] text-[#B4B2A9]">
                  · Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <button onClick={fetchAll} disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-[#E0DDD6] bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#4A4845] hover:bg-[#FAFAF8] transition shadow-sm">
            <Ico d={I.refresh} size={13}  />
            Refresh
          </button>
        </div>

        {
          !can("job", "view") &&
          !can("candidate", "view") &&
          !can("clients", "view") &&
          !can("interview", "view") &&
          !can("submissions", "view") &&
          !can("bench", "view") && (
            <div className="rounded-xl border border-[#D7DEE8] bg-white p-8 text-center shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-semibold text-[#1C1B18]">
                Welcome
              </h2>
              <p className="mt-2 text-sm text-[#6B6860]">
                You currently have access to the dashboard only.
              </p>
            </div>
          )
        }

        {/* ══════════ KPI ROW ══════════ */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">

          {
                      [
            {
              icon: I.brief,
              label: "Open Jobs",
              value: openJobs,
              permission: {
                module: "job",
                action: "view",
              },
              sub: `${onHoldJobs} on hold · ${filledJobs} filled`,
              delta: deltaPct(jobsThisWeek, jobsLastWeek),
              color: "#2563EB",
              route: "/jobs",
            },

            {
              icon: I.users,
              label: "Candidates",
              value: totalCandidates,
              permission: {
                module: "candidate",
                action: "view",
              },
              sub: `${candThisWeek} added this week`,
              delta: deltaPct(candThisWeek, candLastWeek),
              color: "#7C3AED",
              route: "/candidates",
            },

            {
              icon: I.bench,
              label: "On Bench",
              value: benchCandidates.length,
              permission: {
                module: "bench",
                action: "view",
              },
              sub: `${benchPct}% of total pool`,
              delta: null,
              color: "#D97706",
              route: "/bench",
            },

            {
              icon: I.submit,
              label: "Submissions",
              value: totalSubmissions,
              permission: {
                module: "submissions",
                action: "view",
              },
              sub: `${subsThisWeek} this week`,
              delta: deltaPct(subsThisWeek, subsLastWeek),
              color: "#EA580C",
              route: "/submissions",
            },

            {
              icon: I.calendar,
              label: "Interviews",
              value: interviews.filter(
                (iv) => iv.status === "Scheduled"
              ).length,
              permission: {
                module: "interview",
                action: "view",
              },
              sub: `${todayInterviews.length} today`,
              delta: null,
              color: "#0891B2",
              route: "/interviews",
            },

            {
              icon: I.handshake,
              label: "Clients",
              value: totalClients,
              permission: {
                module: "clients",
                action: "view",
              },
              sub: `${clientsThisWeek} added this week`,
              delta: deltaPct(clientsThisWeek, clientsLastWeek),
              color: "#059669",
              route: "/client-list",
            },
          ]
          .filter(kpi =>
              can(
                kpi.permission.module,
                kpi.permission.action
              )
            )
          .map((kpi) => (
            <Link key={kpi.label}
              to={kpi.route}
              className="block cursor-pointer rounded-xl border border-[#D7DEE8] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.06)] hover:border-[#1C4ED8]/40 hover:shadow-md transition group">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: kpi.color + "18", color: kpi.color }}>
                  <Ico d={kpi.icon} size={15} />
                </div>
                {kpi.delta !== null && kpi.delta !== undefined && (
                  <span className={`flex items-center gap-0.5 text-[10.5px] font-semibold ${
                    kpi.delta > 0 ? "text-[#059669]" : kpi.delta < 0 ? "text-[#DC2626]" : "text-[#9B9890]"
                  }`}>
                    <Ico d={kpi.delta > 0 ? I.up : kpi.delta < 0 ? I.down : I.dot} size={9} />
                    {kpi.delta !== 0 ? `${Math.abs(kpi.delta)}%` : "—"}
                  </span>
                )}
              </div>
              <p className="text-[23px] font-bold leading-none text-[#1C1B18]">{kpi.value}</p>
              <p className="mt-1 text-[11px] font-semibold text-[#6B6860]">{kpi.label}</p>
              <p className="mt-0.5 text-[10.5px] text-[#9B9890] truncate">{kpi.sub}</p>
            </Link>
          ))}
        </div>

        {/* ══════════ SUBMISSION PIPELINE ══════════ */}

        <PermissionGuard
          module="submissions"
          action="view"
        >
          <div className="rounded-xl border border-[#D7DEE8] bg-white overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
          <div className="bg-[#FAFAF8] border-b border-[#F0EDE8] px-5 py-3 flex items-center justify-between">
            <div>
              <h2 className="text-[13.5px] font-bold text-[#1C1B18]">Submission Pipeline</h2>
              <p className="text-[11px] text-[#9B9890] mt-0.5">{totalSubmissions} total submissions tracked</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#9B9890]">Placement rate:</span>
              <span className="rounded-full bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-0.5 text-[11px] font-bold text-[#059669]">
                {placementRate}%
              </span>
            </div>
          </div>

          {/* Stage funnel */}
          <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-[#F0EDE8]">
            {pipelineCounts.map((stage, i) => (
              <Link key={stage.key}
                to="/submissions"
                className="block cursor-pointer p-4 text-center hover:bg-[#FAFAF8] transition group">
                <p className="text-[28px] font-bold leading-none" style={{ color: stage.color }}>
                  {stage.count}
                </p>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: stage.color + "bb" }}>
                  {stage.label}
                </p>
                {/* mini bar */}
                <div className="mt-2 h-1 rounded-full overflow-hidden bg-[#F0EDE8]">
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: totalSubmissions > 0 ? `${Math.max(4, (stage.count / totalSubmissions) * 100)}%` : "4%",
                      background: stage.color,
                    }} />
                </div>
                {/* percentage label */}
                <p className="mt-1 text-[9.5px] text-[#9B9890]">
                  {totalSubmissions > 0 ? `${Math.round((stage.count / totalSubmissions) * 100)}%` : "0%"}
                </p>
              </Link>
            ))}
          </div>
        </div>
        </PermissionGuard>

        

        {/* ══════════ ROW: Today's Interviews + Action Needed ══════════ */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* TODAY'S INTERVIEWS */}

          <PermissionGuard
            module="interview"
            action="view"
          >
            <div className="rounded-xl border border-[#D7DEE8] bg-white overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
                      <div className="bg-[#FAFAF8] border-b border-[#F0EDE8] px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                            <Ico d={I.calendar} size={14} />
                          </div>
                          <div>
                            <h2 className="text-[13px] font-bold text-[#1C1B18]">Today's Interviews</h2>
                            <p className="text-[10.5px] text-[#9B9890]">
                              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                            </p>
                          </div>
                        </div>
                        {todayInterviews.length > 0 && (
                          <span className="rounded-full bg-[#2563EB] px-2 py-0.5 text-[10.5px] font-bold text-white">
                            {todayInterviews.length}
                          </span>
                        )}
                      </div>
                      <div className="divide-y divide-[#EEF1F6] max-h-75 overflow-y-auto">
                        {todayInterviews.length === 0 ? (
                          <EmptyBlock msg="No interviews scheduled for today" />
                        ) : (
                          todayInterviews.map((iv) => {
                            const ivStyle = INTERVIEW_STATUS_STYLES[iv.status] || {};
                            return (
                              <Link key={iv.id || iv._id}
                                to="/interviews"
                                className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAF8] cursor-pointer transition">
                                <Avatar name={iv.candidateName} size={34} />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[12.5px] font-semibold text-[#1C1B18] truncate">{iv.candidateName || "—"}</p>
                                  <p className="text-[11px] text-[#6B6860] truncate">
                                    {iv.jobTitle} · {iv.interviewRound || "Interview"} · {iv.interviewType || "—"}
                                  </p>
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="text-[11.5px] font-bold text-[#1C1B18]">{iv.scheduledTime || "—"}</p>
                                  <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold border"
                                    style={{ background: ivStyle.bg, color: ivStyle.text, borderColor: ivStyle.dot + "44" }}>
                                    {iv.status}
                                  </span>
                                </div>
                              </Link>
                            );
                          })
                        )}
                      </div>
                    </div>
          </PermissionGuard>

          

          {/* SUBMISSIONS NEEDING ACTION */}

          <PermissionGuard
            module="submissions"
            action="view"
          >
            <div className="rounded-xl border border-[#D7DEE8] bg-white overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
            <div className="bg-[#FAFAF8] border-b border-[#F0EDE8] px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FEF9C3] text-[#CA8A04]">
                  <Ico d={I.alert} size={14} />
                </div>
                <div>
                  <h2 className="text-[13px] font-bold text-[#1C1B18]">Action Needed</h2>
                  <p className="text-[10.5px] text-[#9B9890]">Submissions waiting on you</p>
                </div>
              </div>
              {actionNeeded.length > 0 && (
                <span className="rounded-full bg-[#EAB308] px-2 py-0.5 text-[10.5px] font-bold text-white">
                  {actionNeeded.length}
                </span>
              )}
            </div>
            <div className="divide-y divide-[#EEF1F6] max-h-75 overflow-y-auto">
              {actionNeeded.length === 0 ? (
                <div className="py-8 text-center">
                  <Ico d={I.check} size={24} className="mx-auto text-[#10B981] mb-2" />
                  <p className="text-[12px] text-[#9B9890]">All caught up! No pending actions.</p>
                </div>
              ) : (
                actionNeeded.map((sub) => {
                  const s = getStatusStyle(sub.status);
                  return (
                    <Link key={sub.id || sub._id}
                      to="/submissions"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAF8] cursor-pointer transition">
                      <Avatar name={sub.candidateName} size={34} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-semibold text-[#1C1B18] truncate">{sub.candidateName || "—"}</p>
                        <p className="text-[11px] text-[#6B6860] truncate">{sub.jobTitle}</p>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-semibold"
                        style={{ background: s.bg, color: s.text, borderColor: s.border || s.dot + "44" }}>
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
                        {sub.status}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
          </PermissionGuard>

          
        </div>

        {/* ══════════ ROW: Bench Aging + Upcoming Interviews ══════════ */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* BENCH AGING */}

          <PermissionGuard
            module="bench"
            action="view"
          >
            <div className="rounded-xl border border-[#D7DEE8] bg-white overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
            <div className="bg-[#FAFAF8] border-b border-[#F0EDE8] px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFF7ED] text-[#D97706]">
                  <Ico d={I.bench} size={14} />
                </div>
                <div>
                  <h2 className="text-[13px] font-bold text-[#1C1B18]">Bench Aging</h2>
                  <p className="text-[10.5px] text-[#9B9890]">
                    {benchCandidates.length} on bench · {benchPct}% of pool
                  </p>
                </div>
              </div>
              <Link to="/bench"
                className="text-[11px] font-semibold text-[#1C4ED8] hover:underline">
                View bench →
              </Link>
            </div>

            {benchCandidates.length === 0 ? (
              <EmptyBlock msg="No candidates currently on bench" />
            ) : (
              <div className="p-4 space-y-3">
                {/* Bands */}
                {agingBands.map((band) => {
                  const pct = benchCandidates.length > 0
                    ? Math.round((band.candidates.length / benchCandidates.length) * 100) : 0;
                  return (
                    <div key={band.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold"
                            style={{ background: band.bg, color: band.color, borderColor: band.border }}>
                            {band.label}
                          </span>
                          {band.min >= 60 && band.candidates.length > 0 && (
                            <span className="text-[10px] text-[#DC2626] font-bold animate-pulse">⚠ URGENT</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#1C1B18]">{band.candidates.length}</span>
                          <span className="text-[10.5px] text-[#9B9890]">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-[#F1EFE8]">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: band.color }} />
                      </div>
                      {/* Show top 3 candidates in this band */}
                      {band.candidates.length > 0 && (
                        <div className="mt-1.5 flex gap-1 flex-wrap">
                          {band.candidates.slice(0, 3).map((c) => (
                            <Link key={c.id || c._id}
                              to={`/candidates/${c.id || c._id}`}
                              className="flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium hover:opacity-80 transition"
                              style={{ background: band.bg, borderColor: band.border, color: band.color }}>
                              <Avatar name={c.name || `${c.firstName} ${c.lastName}`} size={14} />
                              {c.name || `${c.firstName} ${c.lastName}`.trim()}
                              <span className="text-[9px] opacity-70">· {daysAgo(c.createdAt)}d</span>
                            </Link>
                          ))}
                          {band.candidates.length > 3 && (
                            <span className="rounded-full border border-[#E0DDD6] bg-[#EEF1F6] px-2 py-0.5 text-[10px] text-[#6B6860]">
                              +{band.candidates.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          </PermissionGuard>

          

          {/* UPCOMING INTERVIEWS THIS WEEK */}

          <PermissionGuard
            module="interview"
            action="view"
          >
            <div className="rounded-xl border border-[#D7DEE8] bg-white overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
                      <div className="bg-[#FAFAF8] border-b border-[#F0EDE8] px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5F3FF] text-[#7C3AED]">
                            <Ico d={I.clock} size={14} />
                          </div>
                          <div>
                            <h2 className="text-[13px] font-bold text-[#1C1B18]">Upcoming This Week</h2>
                            <p className="text-[10.5px] text-[#9B9890]">Scheduled interviews next 7 days</p>
                          </div>
                        </div>
                        <Link to="/interviews"
                          className="text-[11px] font-semibold text-[#1C4ED8] hover:underline">View all →</Link>
                      </div>
                      <div className="divide-y divide-[#EEF1F6] max-h-82.5 overflow-y-auto">
                        {upcomingInterviews.length === 0 ? (
                          <EmptyBlock msg="No interviews scheduled this week" />
                        ) : (
                          upcomingInterviews.map((iv) => (
                            <Link key={iv.id || iv._id}
                              to="/interviews"
                              className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAF8] cursor-pointer transition">
                              <Avatar name={iv.candidateName} size={32} />
                              <div className="min-w-0 flex-1">
                                <p className="text-[12.5px] font-semibold text-[#1C1B18] truncate">{iv.candidateName || "—"}</p>
                                <p className="text-[11px] text-[#6B6860] truncate">
                                  {iv.jobTitle} · {iv.interviewRound} · {iv.interviewType}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-[11px] font-semibold text-[#7C3AED]">
                                  {fmtTime(iv.scheduledDate, iv.scheduledTime)}
                                </p>
                                <span className="inline-block rounded-md bg-[#EDE9FE] border border-[#C4B5FD] px-1.5 py-0.5 text-[9.5px] font-bold text-[#5B21B6] mt-0.5">
                                  {iv.interviewRound}
                                </span>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
          </PermissionGuard>

          
        </div>

        {/* ══════════ ROW: Urgent Jobs + Top Clients ══════════ */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* URGENT OPEN JOBS */}

          <PermissionGuard
            module="job"
            action="view"
          >
            <div className="rounded-xl border border-[#D7DEE8] bg-white overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
            <div className="bg-[#FAFAF8] border-b border-[#F0EDE8] px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#DC2626]">
                  <Ico d={I.brief} size={14} />
                </div>
                <div>
                  <h2 className="text-[13px] font-bold text-[#1C1B18]">Urgent Open Jobs</h2>
                  <p className="text-[10.5px] text-[#9B9890]">Sorted by days open — needs filling soonest</p>
                </div>
              </div>
              <Link to="/jobs"
                className="text-[11px] font-semibold text-[#1C4ED8] hover:underline">View all →</Link>
            </div>
            <div className="p-4 space-y-3">
              {urgentJobs.length === 0 ? (
                <EmptyBlock msg="No open jobs right now" />
              ) : (
                urgentJobs.map((j) => {
                  const pct   = Math.max(6, (j.daysOpen / maxDays) * 100);
                  const color = j.daysOpen >= 30 ? "#DC2626" : j.daysOpen >= 14 ? "#D97706" : "#2563EB";
                  return (
                    <Link key={j.id}
                      to={`/jobs/${j.id || j._id}`}
                      className="block cursor-pointer group">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[12px] font-semibold text-[#1C1B18] group-hover:text-[#1C4ED8] transition truncate block">
                            {j.title || "Untitled"}
                          </span>
                          <span className="text-[10.5px] text-[#9B9890]">{j.client}</span>
                        </div>
                        <span className="shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-bold"
                          style={{ background: color + "18", color }}>
                          {j.daysOpen}d open
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-[#F1EFE8]">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
          </PermissionGuard>

          

          {/* TOP CLIENTS BY OPEN REQUIREMENTS */}

          <PermissionGuard
          module="clients"
          action="view"
        >
          <div className="rounded-xl border border-[#D7DEE8] bg-white overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
            <div className="bg-[#FAFAF8] border-b border-[#F0EDE8] px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#059669]">
                  <Ico d={I.handshake} size={14} />
                </div>
                <div>
                  <h2 className="text-[13px] font-bold text-[#1C1B18]">Top Clients</h2>
                  <p className="text-[10.5px] text-[#9B9890]">By open job requirements</p>
                </div>
              </div>
              <Link to="/client-list"
                className="text-[11px] font-semibold text-[#1C4ED8] hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-[#EEF1F6]">
              {topClients.length === 0 ? (
                <EmptyBlock msg="No clients with open jobs" />
              ) : (
                topClients.map(([clientName, stats]) => (
                  <Link key={clientName}
                    to="/client-list"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAF8] cursor-pointer transition">
                    <Avatar name={clientName} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-[#1C1B18] truncate">{clientName}</p>
                      <p className="text-[10.5px] text-[#9B9890]">{stats.total} total positions</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-full bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 text-[10.5px] font-bold text-[#2563EB]">
                        {stats.open} open
                      </span>
                      {stats.filled > 0 && (
                        <span className="rounded-full bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 text-[10.5px] font-bold text-[#059669]">
                          {stats.filled} filled
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </PermissionGuard>

          
        </div>

        {/* ══════════ RECENT ACTIVITY FEED ══════════ */}

        <PermissionGuard
          module="submissions"
          action="view"
        >
          <div className="rounded-xl border border-[#D7DEE8] bg-white overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
                  <div className="bg-[#FAFAF8] border-b border-[#F0EDE8] px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF1F6] text-[#6B6860]">
                        <Ico d={I.activity} size={14} />
                      </div>
                      <div>
                        <h2 className="text-[13px] font-bold text-[#1C1B18]">Recent Activity</h2>
                        <p className="text-[10.5px] text-[#9B9890]">Latest submission status changes</p>
                      </div>
                    </div>
                  </div>
                  {recentActivity.length === 0 ? (
                    <EmptyBlock msg="No recent activity" />
                  ) : (
                    <div className="divide-y divide-[#EEF1F6]">
                      {recentActivity.map((act, i) => {
                        const s = getStatusStyle(act.status);
                        return (
                          <Link key={act.id + i}
                            to="/submissions"
                            className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAF8] cursor-pointer transition">
                            {/* timeline dot */}
                            <div className="flex flex-col items-center shrink-0">
                              <div className="h-2.5 w-2.5 rounded-full border-2 border-white shadow"
                                style={{ background: s.dot }} />
                              {i < recentActivity.length - 1 && (
                                <div className="w-px flex-1 bg-[#F0EDE8] mt-1" style={{ height: 20 }} />
                              )}
                            </div>
                            <Avatar name={act.candidateName} size={30} />
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-semibold text-[#1C1B18] truncate">
                                {act.candidateName || "—"}
                                <span className="font-normal text-[#9B9890]"> · {act.jobTitle}</span>
                              </p>
                              {act.note && act.note !== "Submission created" && (
                                <p className="text-[10.5px] text-[#9B9890] truncate italic">"{act.note}"</p>
                              )}
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-1">
                              <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9.5px] font-semibold"
                                style={{ background: s.bg, color: s.text, borderColor: s.border || s.dot + "44" }}>
                                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
                                {act.status}
                              </span>
                              <span className="text-[10px] text-[#9B9890]">{fmtDate(act.changedAt)}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
        </PermissionGuard>

        

      </div>
    </div>
  );
};

export default Home;