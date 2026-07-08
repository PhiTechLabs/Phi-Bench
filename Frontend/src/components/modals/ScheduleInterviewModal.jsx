import React, { useEffect, useState } from "react";
import { listJobs } from "../../api/jobsApi";
import { getCandidateSubmissions } from "../../api/submissionsApi";
import { createInterview, getCandidateInterviews } from "../../api/interviewsApi";

const Ico = ({ d, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

const IC = {
    x:      "M6 18L18 6M6 6l12 12",
    cal:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    check:  "M5 13l4 4L19 7",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    link:   "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    video:  "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
    person: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    map:    "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    user:   "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    warn:   "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
};

// Terminal statuses — submissions in these states can't proceed to interview
const TERMINAL_STATUSES = new Set([
    "Internal Reject", "Screen Reject", "Duplicate",
    "L1 Rejected", "L2 Rejected", "L3 Rejected", "L4 Rejected",
    "Offer Rejected", "Offer Withdrawn", "Final Backout",
    "BGV Failed", "Joining Backout", "Absconded",
    "Replacement Term Ended", "Project Completed", "Project Ended",
    "Joined", "Position Closed",
]);

const ROUNDS    = ["L1", "L2", "L3", "L4", "Final"];
const DURATIONS = [30, 45, 60, 90, 120];

const Label = ({ children, required }) => (
    <p className="mb-1.5 text-[12px] font-semibold text-[#475569]">
        {children}{required && <span className="ml-0.5 text-red-500">*</span>}
    </p>
);

const inputCls = "w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-[13px] text-[#1E293B] placeholder-[#CBD5E1] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 transition";

const ScheduleInterviewModal = ({ candidate, preselectedJob, submissionStatus, onClose, onSuccess }) => {

    // ── Step 1 state (job selection) ─────────────────────────────────────────
    const [candidateSubs,   setCandidateSubs]   = useState([]);
    const [loadingSubs,     setLoadingSubs]     = useState(false);
    const [filteredJobs,    setFilteredJobs]    = useState([]);
    const [jobSearch,       setJobSearch]       = useState("");
    const [selectedJob,     setSelectedJob]     = useState(preselectedJob || null);

    // ── Step 2 state (interview details) ─────────────────────────────────────
    const [linkedSub,       setLinkedSub]       = useState(null);
    const [activeWarning,   setActiveWarning]   = useState("");

    // Derive which round to lock to from the submission status.
    // e.g. "L2 Schedule Pending" → locked to "L2", show only "L2" as option.
    // If status doesn't map to a specific round, fall back to "L1" and show all.
    const lockedRound = submissionStatus
        ? (submissionStatus.match(/^(L[1-4]) Schedule Pending$/) || [])[1] || null
        : null;

    const availableRounds = lockedRound ? [lockedRound] : ["L1", "L2", "L3", "L4", "Final"];

    const [form, setForm] = useState({
        interviewRound: lockedRound || "L1",
        interviewType:  "Virtual",
        scheduledDate:  "",
        scheduledTime:  "",
        duration:       60,
        meetingLink:    "",
        location:       "",
        interviewers:   "",
        notes:          "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [error,      setError]      = useState("");
    const [success,    setSuccess]    = useState(false);
    const [step,       setStep]       = useState(preselectedJob ? 2 : 1);

    // ── Pre-fetch candidate's submissions and build submitted-job list ────────
    // When NOT coming from a preselected job (i.e. opened from CandidateDetails),
    // we pre-fetch the candidate's active submissions so Step 1 only shows
    // jobs they've actually been submitted to. This completely eliminates
    // the UX gap where a recruiter could select an unsubmitted job.
    useEffect(() => {
        if (preselectedJob) return; // SubmissionDetail path — skip, job already known

        (async () => {
            setLoadingSubs(true);
            try {
                const subs = await getCandidateSubmissions(
                    candidate.id || candidate._id
                );
                // Only keep active (non-terminal) submissions — you can't schedule
                // an interview against a rejected or closed submission.
                const activeSubs = (subs || []).filter(
                    (s) => !TERMINAL_STATUSES.has(s.status)
                );
                setCandidateSubs(activeSubs);

                // Build the job list from the active submissions directly —
                // no need to separately fetch all open jobs. Each submission
                // already carries its job ID, title, and client name.
                const jobsFromSubs = activeSubs.map((s) => ({
                    id:     s.job?._id  || s.job?.id  || s.job,
                    _id:    s.job?._id  || s.job?.id  || s.job,
                    title:  s.jobTitle  || s.job?.title,
                    client: s.clientName|| s.job?.client,
                    status: s.job?.status,
                    sub:    s, // the full submission object, for linking later
                })).filter((j) => j.id && j.title); // guard against malformed data

                setFilteredJobs(jobsFromSubs);
            } catch {
                setError("Failed to load submitted jobs.");
            } finally {
                setLoadingSubs(false);
            }
        })();
    }, [preselectedJob, candidate]);

    // ── Filter job list by search query ──────────────────────────────────────
    useEffect(() => {
        if (preselectedJob) return;
        if (!jobSearch.trim()) {
            // Reset to full submissions-based list
            setFilteredJobs(
                candidateSubs.map((s) => ({
                    id:     s.job?._id  || s.job?.id  || s.job,
                    _id:    s.job?._id  || s.job?.id  || s.job,
                    title:  s.jobTitle  || s.job?.title,
                    client: s.clientName|| s.job?.client,
                    status: s.job?.status,
                    sub:    s,
                })).filter((j) => j.id && j.title)
            );
            return;
        }
        const q = jobSearch.toLowerCase();
        setFilteredJobs((prev) =>
            prev.filter((j) =>
                j.title?.toLowerCase().includes(q) ||
                j.client?.toLowerCase().includes(q)
            )
        );
    }, [jobSearch, candidateSubs, preselectedJob]);

    // ── When a job is selected, resolve the linked submission ─────────────────
    // For the CandidateDetails path: we already have the submission from
    // candidateSubs — find it directly without an extra API call.
    // For the SubmissionDetail path (preselectedJob): fetch from the API.
    useEffect(() => {
        if (!selectedJob || !candidate) return;
        setActiveWarning("");

        (async () => {
            try {
                let match = null;

                if (preselectedJob) {
                    // SubmissionDetail path — need to fetch subs to find the match
                    const subs = await getCandidateSubmissions(
                        candidate.id || candidate._id
                    );
                    match = subs.find((s) => {
                        const jid = s.job?._id || s.job?.id || s.job;
                        return jid === (selectedJob.id || selectedJob._id);
                    });
                } else {
                    // CandidateDetails path — we already have the subs pre-fetched.
                    // The job object carries its own `sub` property from filteredJobs.
                    match = selectedJob.sub || candidateSubs.find((s) => {
                        const jid = s.job?._id || s.job?.id || s.job;
                        return String(jid) === String(selectedJob.id || selectedJob._id);
                    });
                }

                setLinkedSub(match || null);

                // Check for active already-scheduled interview on this job
                const interviews = await getCandidateInterviews(
                    candidate.id || candidate._id
                );
                const active = interviews.find((iv) => {
                    const jid = iv.job?._id || iv.job?.id || iv.job;
                    const sameJob = String(jid) === String(selectedJob.id || selectedJob._id);
                    return sameJob &&
                        (iv.status === "Scheduled" || iv.status === "Rescheduled") &&
                        !iv.outcome;
                });
                if (active) {
                    setActiveWarning(
                        `An ${active.interviewRound} interview is already scheduled. Submit feedback for it before scheduling a new one.`
                    );
                }
            } catch {
                setLinkedSub(null);
            }
        })();
    }, [selectedJob, candidate, preselectedJob, candidateSubs]);

    const set = (field, value) => { setForm((p) => ({ ...p, [field]: value })); setError(""); };

    const handleSchedule = async () => {
        if (!linkedSub) {
            setError("This candidate hasn't been submitted to this job yet. Submit them first.");
            return;
        }
        if (!form.scheduledDate) { setError("Please select a date."); return; }
        if (!form.scheduledTime) { setError("Please select a time."); return; }
        setSubmitting(true); setError("");
        try {
            const ivrs = form.interviewers
                ? form.interviewers.split(",").map((s) => s.trim()).filter(Boolean)
                : [];
            await createInterview({
                candidateId:    candidate.id || candidate._id,
                jobId:          selectedJob.id || selectedJob._id,
                submissionId:   linkedSub?.id || linkedSub?._id,
                interviewRound: form.interviewRound,
                interviewType:  form.interviewType,
                scheduledDate:  form.scheduledDate,
                scheduledTime:  form.scheduledTime,
                duration:       Number(form.duration) || 60,
                meetingLink:    form.meetingLink.trim(),
                location:       form.location.trim(),
                interviewers:   ivrs,
                notes:          form.notes.trim(),
            });
            setSuccess(true);
            setTimeout(() => { onSuccess?.(); onClose(); }, 1400);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to schedule interview.");
        } finally {
            setSubmitting(false);
        }
    };

    const candidateName = candidate.name ||
        `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}>
            <div className="absolute inset-0" onClick={() => !submitting && onClose()} />

            <div className="relative w-full max-w-[500px] rounded-2xl bg-white overflow-hidden"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.06)", animation: "siUp .18s cubic-bezier(.22,1,.36,1)" }}>

                {/* ── HEADER ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF]">
                            <Ico d={IC.cal} size={17} />
                        </div>
                        <div>
                            <p className="text-[15px] font-bold text-[#1E293B] leading-tight">Schedule Interview</p>
                            <p className="text-[12px] text-[#94A3B8] mt-0.5">{candidateName}</p>
                        </div>
                    </div>
                    <button onClick={() => !submitting && onClose()}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition">
                        <Ico d={IC.x} size={16} />
                    </button>
                </div>

                {/* ── STEP TABS (only when no preselectedJob) ── */}
                {!preselectedJob && (
                    <div className="flex border-b border-[#F1F5F9] px-6">
                        {["Select Job", "Interview Details"].map((label, i) => (
                            <button key={i} onClick={() => i === 0 && setStep(1)}
                                className="mr-6 py-3 text-[12.5px] font-semibold border-b-2 transition"
                                style={{
                                    borderColor: step === i + 1 ? "#2563EB" : "transparent",
                                    color:       step === i + 1 ? "#2563EB" : "#94A3B8",
                                }}>
                                {i + 1}. {label}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── BODY ── */}
                <div className="px-6 py-5 max-h-[62vh] overflow-y-auto space-y-5"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "#E2E8F0 transparent" }}>

                    {/* STEP 1 — SELECT JOB (from submissions only) */}
                    {step === 1 && (
                        <div className="space-y-3">
                            {/* Context banner explaining the filter */}
                            <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-[12px] text-[#1D4ED8]">
                                <p className="font-semibold">Submitted jobs only</p>
                                <p className="mt-0.5 text-[#3B82F6]">
                                    Interviews can only be scheduled against jobs this candidate has already been submitted to.
                                </p>
                            </div>

                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#CBD5E1]">
                                    <Ico d={IC.search} size={14} />
                                </span>
                                <input type="text" placeholder="Search by job title or client…"
                                    value={jobSearch} onChange={(e) => setJobSearch(e.target.value)}
                                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-9 pr-4 text-[13px] text-[#1E293B] placeholder-[#CBD5E1] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 transition" />
                            </div>

                            {loadingSubs ? (
                                <div className="flex justify-center py-10">
                                    <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-[#E2E8F0] border-t-[#2563EB]" />
                                </div>
                            ) : filteredJobs.length === 0 ? (
                                <div className="rounded-xl border border-[#FEE2E2] bg-[#FFF7F7] px-5 py-8 text-center">
                                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FEE2E2] text-[#DC2626]">
                                        <Ico d={IC.warn} size={20} />
                                    </div>
                                    <p className="text-[13px] font-semibold text-[#991B1B]">No submitted jobs</p>
                                    <p className="mt-1 text-[12px] text-[#B91C1C]">
                                        This candidate hasn't been submitted to any active job yet.
                                        Submit them to a job first, then schedule an interview.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-0.5"
                                    style={{ scrollbarWidth: "thin" }}>
                                    {filteredJobs.map((job) => {
                                        const sel = selectedJob?.id === job.id;
                                        const sub = job.sub;
                                        return (
                                            <button key={job.id} onClick={() => { setSelectedJob(job); setError(""); }}
                                                className="w-full rounded-xl border px-4 py-3 text-left transition-all"
                                                style={{
                                                    background:  sel ? "#EFF6FF" : "#FAFAFA",
                                                    borderColor: sel ? "#2563EB" : "#E5E7EB",
                                                    boxShadow:   sel ? "0 0 0 2px rgba(37,99,235,0.12)" : "none",
                                                }}>
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition"
                                                        style={{
                                                            borderColor:     sel ? "#2563EB" : "#D1D5DB",
                                                            backgroundColor: sel ? "#2563EB" : "white",
                                                        }}>
                                                        {sel && <Ico d={IC.check} size={10} />}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-[13px] font-semibold"
                                                            style={{ color: sel ? "#1D4ED8" : "#1E293B" }}>
                                                            {job.title}
                                                        </p>
                                                        <p className="text-[11.5px] text-[#94A3B8] mt-0.5">
                                                            {job.client}
                                                        </p>
                                                    </div>
                                                    {/* Show submission status as a badge */}
                                                    {sub?.status && (
                                                        <span className="ml-auto shrink-0 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[10.5px] font-semibold text-[#059669]">
                                                            {sub.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {step === 1 && error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[12.5px] text-red-700">⚠ {error}</div>
                            )}
                        </div>
                    )}

                    {/* STEP 2 — INTERVIEW DETAILS */}
                    {step === 2 && (
                        <div className="space-y-5">
                            {/* Selected job + linked submission pill */}
                            {selectedJob && (
                                <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-[13px] font-semibold text-[#1E293B]">{selectedJob.title}</p>
                                        {selectedJob.client && (
                                            <p className="text-[11.5px] text-[#94A3B8] mt-0.5">{selectedJob.client}</p>
                                        )}
                                    </div>
                                    {linkedSub && (
                                        <span className="ml-auto flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#059669] shrink-0">
                                            <Ico d={IC.link} size={10} /> Linked
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Active interview warning */}
                            {activeWarning && (
                                <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-[12px] font-medium text-amber-800"
                                    style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A" }}>
                                    <span className="shrink-0 mt-0.5">⚠</span>
                                    <span>{activeWarning}</span>
                                </div>
                            )}

                            {/* Interview Round */}
                            <div>
                                <Label>Interview Round</Label>
                                {lockedRound ? (
                                    // Round is locked to match the submission's Lx Schedule Pending status
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="rounded-lg border px-4 py-1.5 text-[12.5px] font-bold"
                                            style={{ background: "#1e3a5f", color: "white", borderColor: "#1e3a5f" }}
                                        >
                                            {lockedRound}
                                        </button>
                                        <span className="text-[11px] text-[#94A3B8]">
                                            Locked — submission is at {lockedRound} Schedule Pending
                                        </span>
                                    </div>
                                ) : (
                                <div className="flex gap-2 flex-wrap">
                                    {availableRounds.map((r) => {
                                        const sel = form.interviewRound === r;
                                        return (
                                            <button key={r} onClick={() => set("interviewRound", r)}
                                                className="rounded-lg border px-4 py-1.5 text-[12.5px] font-bold transition-all"
                                                style={{
                                                    background:  sel ? "#1e3a5f" : "#F8FAFC",
                                                    color:       sel ? "white"   : "#475569",
                                                    borderColor: sel ? "#1e3a5f" : "#E2E8F0",
                                                }}>
                                                {r}
                                            </button>
                                        );
                                    })}
                                </div>
                                )}
                            </div>

                            {/* Interview Mode */}
                            <div>
                                <Label>Interview Mode</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: "Virtual",      icon: IC.video,  label: "Virtual",      sub: "Online / Video call" },
                                        { value: "Face to Face", icon: IC.person, label: "Face to Face", sub: "In-person meeting"    },
                                    ].map(({ value, icon, label, sub }) => {
                                        const sel = form.interviewType === value;
                                        return (
                                            <button key={value} onClick={() => set("interviewType", value)}
                                                className="flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all"
                                                style={{
                                                    background:  sel ? "#EFF6FF" : "#F8FAFC",
                                                    borderColor: sel ? "#2563EB" : "#E2E8F0",
                                                }}>
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition"
                                                    style={{ background: sel ? "#2563EB" : "#E2E8F0", color: sel ? "white" : "#94A3B8" }}>
                                                    <Ico d={icon} size={17} />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-bold leading-tight"
                                                        style={{ color: sel ? "#1D4ED8" : "#374151" }}>{label}</p>
                                                    <p className="text-[11px] mt-0.5"
                                                        style={{ color: sel ? "#3B82F6" : "#9CA3AF" }}>{sub}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Date + Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label required>Date</Label>
                                    <input type="date" value={form.scheduledDate}
                                        onChange={(e) => set("scheduledDate", e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                        className={inputCls} />
                                </div>
                                <div>
                                    <Label required>Time</Label>
                                    <input type="time" value={form.scheduledTime}
                                        onChange={(e) => set("scheduledTime", e.target.value)}
                                        className={inputCls} />
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <Label>Duration</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {DURATIONS.map((d) => {
                                        const sel = Number(form.duration) === d;
                                        return (
                                            <button key={d} onClick={() => set("duration", d)}
                                                className="rounded-lg border px-3.5 py-1.5 text-[12.5px] font-semibold transition-all"
                                                style={{
                                                    background:  sel ? "#EFF6FF" : "#F8FAFC",
                                                    borderColor: sel ? "#2563EB" : "#E2E8F0",
                                                    color:       sel ? "#1D4ED8" : "#475569",
                                                }}>
                                                {d} min
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Meeting link / Location (conditional) */}
                            {form.interviewType === "Virtual" ? (
                                <div>
                                    <Label>Meeting Link</Label>
                                    <input type="url" value={form.meetingLink}
                                        onChange={(e) => set("meetingLink", e.target.value)}
                                        placeholder="https://meet.google.com/…"
                                        className={inputCls} />
                                </div>
                            ) : (
                                <div>
                                    <Label>Location</Label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#CBD5E1]">
                                            <Ico d={IC.map} size={14} />
                                        </span>
                                        <input type="text" value={form.location}
                                            onChange={(e) => set("location", e.target.value)}
                                            placeholder="Office address or venue"
                                            className={`${inputCls} pl-9`} />
                                    </div>
                                </div>
                            )}

                            {/* Interviewers */}
                            <div>
                                <Label>Interviewers <span className="font-normal text-[#94A3B8]">(comma-separated)</span></Label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#CBD5E1]">
                                        <Ico d={IC.user} size={14} />
                                    </span>
                                    <input type="text" value={form.interviewers}
                                        onChange={(e) => set("interviewers", e.target.value)}
                                        placeholder="John Smith, Jane Doe"
                                        className={`${inputCls} pl-9`} />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <Label>Notes</Label>
                                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
                                    rows={2} placeholder="Any additional context or instructions…"
                                    className={`${inputCls} resize-none`} />
                            </div>

                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[12.5px] font-medium text-red-700">
                                    ⚠ {error}
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[12.5px] font-semibold text-emerald-700">
                                    <Ico d={IC.check} size={13} /> Interview scheduled — status updated!
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── FOOTER ── */}
                <div className="flex items-center justify-between border-t border-[#F1F5F9] px-6 py-4">
                    {step === 1 ? (
                        <>
                            <button onClick={() => !submitting && onClose()}
                                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#64748B] hover:bg-[#F8FAFC] transition">
                                Cancel
                            </button>
                            <button onClick={() => {
                                    if (!selectedJob) { setError("Please select a job first."); return; }
                                    setError(""); setStep(2);
                                }}
                                disabled={!selectedJob || filteredJobs.length === 0}
                                className="rounded-lg bg-[#1e3a5f] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#162b45] transition disabled:opacity-40">
                                Next →
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => { if (!preselectedJob) setStep(1); else onClose(); setError(""); }}
                                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#64748B] hover:bg-[#F8FAFC] transition">
                                {preselectedJob ? "Cancel" : "← Back"}
                            </button>
                            <button
                                onClick={handleSchedule}
                                disabled={submitting || success || !!activeWarning || !linkedSub}
                                className="flex items-center gap-2 rounded-lg px-5 py-2 text-[13px] font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: "#16A34A" }}
                                onMouseEnter={e => { if (!submitting && !success && !activeWarning && linkedSub) e.currentTarget.style.background = "#15803D"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "#16A34A"; }}>
                                {submitting ? (
                                    <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Scheduling…</>
                                ) : success ? (
                                    <><Ico d={IC.check} size={14} /> Scheduled!</>
                                ) : (
                                    <><Ico d={IC.cal} size={14} /> Schedule Interview</>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <style>{`@keyframes siUp{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}`}</style>
        </div>
    );
};

export default ScheduleInterviewModal;