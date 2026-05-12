import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaUsers,
  FaUserTie,
  FaHandshake,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

import { listJobs }       from "../api/jobsApi";
import { listCandidates } from "../api/candidatesApi";
import { getAllClients }  from "../api/clientApi";
import {
  listInterviews,
  listUpcomingInterviews,
} from "../api/interviewsApi";

/* ─────────────────────────────────────────────────────────────
 *  CONSTANTS
 * ───────────────────────────────────────────────────────────── */
const POLL_INTERVAL_MS = 45_000;

const PIPELINE_STAGES = [
  { key: "New",         label: "New",         bg: "#F1F5F9", text: "#475569" },
  { key: "Screening",   label: "Screening",   bg: "#FFFBEB", text: "#B45309" },
  { key: "Shortlisted", label: "Shortlisted", bg: "#EFF6FF", text: "#1D4ED8" },
  { key: "Interview",   label: "Interview",   bg: "#F5F3FF", text: "#6D28D9" },
  { key: "Offer",       label: "Offer",       bg: "#FFF7ED", text: "#C2410C" },
  { key: "Hired",       label: "Hired",       bg: "#ECFDF5", text: "#047857" },
];

/* ─────────────────────────────────────────────────────────────
 *  HELPERS
 * ───────────────────────────────────────────────────────────── */
const daysAgo = (dateStr) => {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  if (isNaN(d)) return Infinity;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
};

const countWithinDays = (items, dateField, days) => {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter((i) => {
    const t = new Date(i[dateField]).getTime();
    return !isNaN(t) && t >= cutoff;
  }).length;
};

const deltaPct = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const fmtDateTime = (dt) => {
  const d = new Date(dt);
  if (isNaN(d)) return "—";
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const urgencyColor = (days) => {
  if (days >= 14) return "#A32D2D";
  if (days >= 7)  return "#BA7517";
  if (days >= 3)  return "#185FA5";
  return "#0F6E56";
};

/* ─────────────────────────────────────────────────────────────
 *  COMPONENT
 * ───────────────────────────────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const roleBase = user?.role ? `/${user.role}` : "";

  /* ── raw data state ── */
  const [jobs, setJobs]               = useState([]);
  const [candidates, setCandidates]   = useState([]);
  const [clients, setClients]         = useState([]);
  const [interviews, setInterviews]   = useState([]);
  const [upcoming, setUpcoming]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  /* ── single fetch routine, reused by initial load and polling ── */
  const isMountedRef = useRef(true);

  const fetchAll = useCallback(async () => {
    try {
      const [jobsRes, candidatesRes, clientsRes, interviewsRes, upcomingRes] =
        await Promise.all([
          listJobs(),
          listCandidates(),
          getAllClients(),
          listInterviews(),
          listUpcomingInterviews(5),
        ]);

      if (!isMountedRef.current) return;

      setJobs(jobsRes || []);
      setCandidates(candidatesRes || []);
      const clientList = Array.isArray(clientsRes)
        ? clientsRes
        : clientsRes?.data || clientsRes?.clients || [];
      setClients(clientList);
      setInterviews(interviewsRes || []);
      setUpcoming(upcomingRes || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn("Dashboard fetch failed:", err);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchAll();
    const interval = setInterval(fetchAll, POLL_INTERVAL_MS);
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchAll]);

  /* ─────────────────────────────────────────────────────────────
   *  DERIVED METRICS — all computed, never hardcoded
   * ───────────────────────────────────────────────────────────── */

  // KPIs: counts with week-over-week deltas
  const activeJobs    = jobs.filter((j) => j.status === "Open" || j.status === "On Hold").length;
  const jobsThisWeek  = countWithinDays(jobs, "createdAt", 7);
  const jobsLastWeek  = countWithinDays(jobs, "createdAt", 14) - jobsThisWeek;
  const jobsDelta     = deltaPct(jobsThisWeek, jobsLastWeek);

  const candidatesThisWeek = countWithinDays(candidates, "createdAt", 7);
  const candidatesLastWeek = countWithinDays(candidates, "createdAt", 14) - candidatesThisWeek;
  const candidatesDelta    = deltaPct(candidatesThisWeek, candidatesLastWeek);

  const interviewsScheduled = interviews.filter((iv) => iv.status === "Scheduled").length;
  const interviewsThisWeek  = countWithinDays(interviews, "createdAt", 7);
  const interviewsLastWeek  = countWithinDays(interviews, "createdAt", 14) - interviewsThisWeek;
  const interviewsDelta     = deltaPct(interviewsThisWeek, interviewsLastWeek);

  const totalClients     = clients.length;
  const clientsThisWeek  = countWithinDays(clients, "createdAt", 7);
  const clientsLastWeek  = countWithinDays(clients, "createdAt", 14) - clientsThisWeek;
  const clientsDelta     = deltaPct(clientsThisWeek, clientsLastWeek);

  // Pipeline funnel — count candidates by their status
  // Plus: include candidates that have an upcoming scheduled interview in the Interview stage
  const candidatesWithInterviews = new Set(
    interviews
      .filter((iv) => iv.status === "Scheduled")
      .map((iv) => iv.candidateId)
      .filter(Boolean)
  );

  const pipelineCounts = PIPELINE_STAGES.map((stage) => {
    let count = candidates.filter((c) => c.status === stage.key).length;
    if (stage.key === "Interview") {
      // also include candidates with scheduled interviews even if status not yet flipped
      const extras = candidates.filter(
        (c) => c.status !== "Interview" && candidatesWithInterviews.has(c.id)
      ).length;
      count += extras;
    }
    return { ...stage, count };
  });

  const totalPipeline = pipelineCounts.reduce((a, s) => a + s.count, 0);

  // Top urgent jobs — non-closed/filled, sorted by days open
  const topUrgentJobs = jobs
    .filter((j) => j.status !== "Filled" && j.status !== "Closed")
    .map((j) => ({
      ...j,
      daysOpen: daysAgo(j.dateOpened || j.createdAt),
    }))
    .sort((a, b) => b.daysOpen - a.daysOpen)
    .slice(0, 5);

  const maxDaysOpen = Math.max(1, ...topUrgentJobs.map((j) => j.daysOpen));

  // Bench utilization
  const benchCandidates  = candidates.filter((c) => c.onBench === true);
  const totalCandidates  = candidates.length;
  const benchPct = totalCandidates > 0
    ? Math.round((benchCandidates.length / totalCandidates) * 100)
    : 0;

  /* ─────────────────────────────────────────────────────────────
   *  RENDER HELPERS
   * ───────────────────────────────────────────────────────────── */

  const KpiCard = ({ icon, label, value, delta, deltaLabel, route }) => (
    <div
      onClick={() => route && navigate(route)}
      className="cursor-pointer rounded-xl border border-[#E8E6E0] bg-white p-4 transition hover:border-[#1C4ED8]/30 hover:shadow-sm"
    >
      <div className="mb-2 flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-wide text-[#9B9890]">
        <span className="text-[#1C4ED8]">{icon}</span>
        {label}
      </div>
      <div className="text-[24px] font-semibold leading-tight text-[#1C1B18]">
        {value === 0 || value === "—" ? "—" : value}
      </div>
      {delta !== null && delta !== undefined && (
        <div
          className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${
            delta > 0 ? "text-[#047857]" : delta < 0 ? "text-[#B91C1C]" : "text-[#9B9890]"
          }`}
        >
          {delta > 0 ? <FaArrowUp size={9} /> : delta < 0 ? <FaArrowDown size={9} /> : null}
          {delta === 0 ? "No change" : `${Math.abs(delta)}% ${deltaLabel}`}
        </div>
      )}
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
   *  RENDER
   * ───────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      <div className="w-full px-4 py-4 sm:px-6 sm:py-5 lg:px-8 2xl:px-12">

        {/* HEADER */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-[22px] font-semibold leading-tight text-[#1C1B18]">Dashboard</h1>
            <p className="mt-0.5 text-[12.5px] text-[#9B9890]">
              Overview of your recruitment pipeline
              {lastUpdated && (
                <span className="ml-2 text-[11px] text-[#B4B2A9]">
                  · Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchAll}
            className="rounded-lg border border-[#E0DDD6] bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#4A4845] hover:bg-[#FAFAF8]"
          >
            ↻ Refresh
          </button>
        </div>

        {loading && !lastUpdated ? (
          <div className="rounded-xl border border-[#E8E6E0] bg-white p-12 text-center text-[12.5px] text-[#9B9890]">
            Loading dashboard…
          </div>
        ) : (
          <>

            {/* ─── KPI ROW ─── */}
            <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <KpiCard
                icon={<FaBriefcase />}
                label="Active Jobs"
                value={activeJobs}
                delta={jobsDelta}
                deltaLabel="vs last week"
                route={`${roleBase}/jobs`}
              />
              <KpiCard
                icon={<FaUsers />}
                label="Candidates"
                value={totalCandidates}
                delta={candidatesDelta}
                deltaLabel="vs last week"
                route={`${roleBase}/candidates`}
              />
              <KpiCard
                icon={<FaUserTie />}
                label="Interviews"
                value={interviewsScheduled}
                delta={interviewsDelta}
                deltaLabel="vs last week"
                route={`${roleBase}/interviews`}
              />
              <KpiCard
                icon={<FaHandshake />}
                label="Clients"
                value={totalClients}
                delta={clientsDelta}
                deltaLabel="vs last week"
                route={`${roleBase}/client-list`}
              />
            </div>

            {/* ─── ROW 2: Pipeline + Bench ─── */}
            <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-3">

              {/* PIPELINE FUNNEL (spans 2 cols) */}
              <div className="rounded-xl border border-[#E8E6E0] bg-white p-4 lg:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-[14px] font-semibold text-[#1C1B18]">Recruitment Pipeline</h2>
                  <span className="text-[11px] text-[#9B9890]">
                    {totalPipeline} candidate{totalPipeline === 1 ? "" : "s"} tracked
                  </span>
                </div>

                {totalPipeline === 0 ? (
                  <div className="py-8 text-center text-[12px] text-[#9B9890]">
                    No candidates in the pipeline yet
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {pipelineCounts.map((stage) => (
                      <div
                        key={stage.key}
                        onClick={() => navigate(`${roleBase}/candidates`)}
                        className="cursor-pointer rounded-lg p-3 text-center transition hover:opacity-80"
                        style={{ background: stage.bg }}
                      >
                        <div className="text-[20px] font-semibold leading-none" style={{ color: stage.text }}>
                          {stage.count}
                        </div>
                        <div className="mt-1 text-[10.5px] font-medium" style={{ color: stage.text }}>
                          {stage.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {totalPipeline > 0 && (
                  <div className="mt-3 border-t border-[#F1EFE8] pt-3 text-[11px] text-[#6B6860]">
                    Conversion (New → Hired):{" "}
                    <span className="font-medium text-[#1C1B18]">
                      {pipelineCounts[0].count > 0
                        ? `${Math.round((pipelineCounts[5].count / pipelineCounts[0].count) * 100)}%`
                        : "—"}
                    </span>
                  </div>
                )}
              </div>

              {/* BENCH UTILIZATION */}
              <div className="rounded-xl border border-[#E8E6E0] bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-[14px] font-semibold text-[#1C1B18]">Bench Utilization</h2>
                </div>

                <div className="flex items-center gap-4">
                  {/* Donut chart */}
                  <svg width="84" height="84" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F1EFE8" strokeWidth="3.5" />
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke="#1C4ED8"
                      strokeWidth="3.5"
                      strokeDasharray={`${benchPct} 100`}
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                    />
                    <text x="18" y="20.5" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1C1B18">
                      {benchPct}%
                    </text>
                  </svg>

                  <div className="text-[12px] leading-relaxed text-[#4A4845]">
                    <div>
                      <span className="font-semibold text-[#1C1B18]">{benchCandidates.length}</span> on bench
                    </div>
                    <div className="text-[#9B9890]">
                      of {totalCandidates} total candidate{totalCandidates === 1 ? "" : "s"}
                    </div>
                    <button
                      onClick={() => navigate(`${roleBase}/bench`)}
                      className="mt-1.5 text-[11px] font-medium text-[#1C4ED8] hover:underline"
                    >
                      View bench →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── ROW 3: Upcoming Interviews + Top Urgent Jobs ─── */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

              {/* UPCOMING INTERVIEWS */}
              <div className="rounded-xl border border-[#E8E6E0] bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-[14px] font-semibold text-[#1C1B18]">Upcoming Interviews</h2>
                  <button
                    onClick={() => navigate(`${roleBase}/interviews`)}
                    className="text-[11px] font-medium text-[#1C4ED8] hover:underline"
                  >
                    View all →
                  </button>
                </div>

                {upcoming.length === 0 ? (
                  <div className="py-8 text-center text-[12px] text-[#9B9890]">
                    No interviews scheduled in the next 7 days
                  </div>
                ) : (
                  <div className="divide-y divide-[#F1EFE8]">
                    {upcoming.map((iv) => (
                      <div
                        key={iv.id}
                        onClick={() => navigate(`${roleBase}/interviews`)}
                        className="flex cursor-pointer items-center gap-3 py-2.5 transition hover:bg-[#FAFAF8]"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF6FF] text-[11px] font-semibold text-[#1D4ED8]">
                          {initials(iv.candidateName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12.5px] font-medium text-[#1C1B18]">
                            {iv.candidateName || "Unnamed"}
                            {iv.jobTitle && (
                              <span className="text-[#9B9890]"> · {iv.jobTitle}</span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#6B6860]">
                            {iv.round || "Interview"} · {iv.mode || "Video"}
                            {iv.interviewer && <> · with {iv.interviewer}</>}
                          </div>
                        </div>
                        <div className="shrink-0 rounded-md bg-[#EFF6FF] px-2 py-1 text-[10.5px] font-medium text-[#1D4ED8]">
                          {fmtDateTime(iv.dateTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TOP URGENT JOBS */}
              <div className="rounded-xl border border-[#E8E6E0] bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-[14px] font-semibold text-[#1C1B18]">Top Urgent Jobs</h2>
                  <button
                    onClick={() => navigate(`${roleBase}/jobs`)}
                    className="text-[11px] font-medium text-[#1C4ED8] hover:underline"
                  >
                    View all →
                  </button>
                </div>

                {topUrgentJobs.length === 0 ? (
                  <div className="py-8 text-center text-[12px] text-[#9B9890]">
                    No open jobs right now
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {topUrgentJobs.map((j) => {
                      const widthPct = Math.max(8, (j.daysOpen / maxDaysOpen) * 100);
                      const color = urgencyColor(j.daysOpen);
                      return (
                        <div
                          key={j.id}
                          onClick={() => navigate(`${roleBase}/jobs/${j.id}`)}
                          className="cursor-pointer transition hover:opacity-80"
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <div className="truncate text-[12px] font-medium text-[#1C1B18]">
                              {j.title || "Untitled role"}
                              {j.client && (
                                <span className="text-[#9B9890]"> · {j.client}</span>
                              )}
                            </div>
                            <div className="shrink-0 text-[11px] font-medium" style={{ color }}>
                              {j.daysOpen === Infinity ? "—" : `${j.daysOpen}d open`}
                            </div>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-[#F1EFE8]">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${widthPct}%`, background: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;