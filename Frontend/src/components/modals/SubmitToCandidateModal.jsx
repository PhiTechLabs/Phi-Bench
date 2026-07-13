import React, { useEffect, useState } from "react";
import { listCandidates } from "../../api/candidatesApi";
import { createSubmission } from "../../api/submissionsApi";

// ─── ICON ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

const icons = {
    x:       "M6 18L18 6M6 6l12 12",
    search:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    submit:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    check:   "M5 13l4 4L19 7",
    user:    "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
};

// ─── SUBMIT CANDIDATE MODAL ────────────────────────────────────────────────────
// Inverse of SubmitToJobModal — the JOB is already known (from the Job Details
// page), and the user picks which CANDIDATE to submit to it.
// SubmitToJobModal is untouched; this is a new, independent component.
const SubmitToCandidateModal = ({ job, existingSubmissions = [], onClose, onSuccess }) => {
    const [candidates, setCandidates]       = useState([]);
    const [filtered, setFiltered]           = useState([]);
    const [search, setSearch]               = useState("");
    const [selectedCandidate, setSelected]  = useState(null);
    const [recruiterNotes, setNotes]        = useState("");
    const [loading, setLoading]             = useState(true);
    const [submitting, setSubmitting]       = useState(false);
    const [error, setError]                 = useState("");
    const [success, setSuccess]             = useState(false);

    // Build a Set of already-submitted candidate IDs so we can filter them
    // out before rendering — no point showing candidates a recruiter can't
    // actually submit, since clicking them would just produce a confusing
    // "already submitted" error. The candidate field on each submission is
    // either a populated object (with _id) or a raw ID string.
    const alreadySubmittedIds = new Set(
        existingSubmissions.map((s) =>
            s.candidate?._id || s.candidate?.id || s.candidate || ""
        ).filter(Boolean)
    );

    // Fetch all candidates on mount, excluding those already submitted
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const all = await listCandidates();
                const available = all.filter(
                    (c) => !alreadySubmittedIds.has(c.id) && !alreadySubmittedIds.has(c._id)
                );
                setCandidates(available);
                setFiltered(available);
            } catch (err) {
                console.error(err);
                setError("Failed to load candidates.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Filter candidates by search
    useEffect(() => {
        if (!search.trim()) {
            setFiltered(candidates);
            return;
        }
        const q = search.toLowerCase();
        setFiltered(
            candidates.filter(
                (c) =>
                    c.name?.toLowerCase().includes(q) ||
                    c.email?.toLowerCase().includes(q) ||
                    c.jobTitle?.toLowerCase().includes(q) ||
                    c.code?.toLowerCase().includes(q)
            )
        );
    }, [search, candidates]);

    const handleSubmit = async () => {
        if (!selectedCandidate) {
            setError("Please select a candidate to submit.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            await createSubmission({
                candidateId:    selectedCandidate.id || selectedCandidate._id,
                jobId:          job.id || job._id,
                recruiterNotes: recruiterNotes.trim(),
            });

            setSuccess(true);

            // Auto-close after 1.5s and notify parent to refresh submissions
            setTimeout(() => {
                onSuccess && onSuccess();
                onClose();
            }, 1500);

        } catch (err) {
            console.error(err);
            setError(
                err?.response?.data?.message ||
                "Failed to submit candidate. They may already be submitted to this job."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Initials avatar for candidates that don't have a photo
    const Avatar = ({ candidate }) => {
        const initials = candidate.initials ||
            [candidate.firstName?.[0], candidate.lastName?.[0]]
                .filter(Boolean).join("").toUpperCase() ||
            candidate.name?.[0]?.toUpperCase() || "?";

        return (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[11px] font-bold text-[#2563EB]">
                {initials}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-65 flex items-start justify-center bg-black/50 px-4 pt-20 pb-6">
            <div className="flex w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl overflow-hidden" style={{ maxHeight: "calc(100vh - 6.5rem)" }}>

                {/* ── Header ── */}
                <div className="flex shrink-0 items-center justify-between border-b border-[#F1F5F9] px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                            <Icon d={icons.submit} size={17} />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-[#1E293B]">Submit Candidate</h2>
                            <p className="text-[12px] text-[#94A3B8] truncate max-w-65">
                                {job.title}
                                {job.client ? ` · ${job.client}` : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition"
                    >
                        <Icon d={icons.x} size={17} />
                    </button>
                </div>

                {/* ── Content ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-0">

                    {/* Search */}
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#94A3B8]">
                            <Icon d={icons.search} size={15} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, email, title, or code…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-9 pr-4 text-[13px] text-[#1E293B] placeholder-[#CBD5E1] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                        />
                    </div>

                    {/* Candidate list */}
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2563EB]" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="rounded-lg bg-[#F8FAFC] py-8 text-center">
                            <p className="text-[13px] text-[#94A3B8]">
                                {candidates.length === 0
                                    ? "All candidates have already been submitted to this job"
                                    : "No candidates match your search"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
                                Select a candidate ({filtered.length})
                            </p>
                            <div className="space-y-1.5 max-h-70 overflow-y-auto pr-1">
                                {filtered.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            setSelected(c);
                                            setError("");
                                        }}
                                        className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                                            selectedCandidate?.id === c.id
                                                ? "border-[#2563EB] bg-[#EFF6FF]"
                                                : "border-[#E2E8F0] bg-white hover:border-[#BFDBFE] hover:bg-[#F8FAFC]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Radio */}
                                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                                selectedCandidate?.id === c.id
                                                    ? "border-[#2563EB] bg-[#2563EB]"
                                                    : "border-[#CBD5E1] bg-white"
                                            }`}>
                                                {selectedCandidate?.id === c.id && (
                                                    <Icon d={icons.check} size={10} />
                                                )}
                                            </div>

                                            {/* Avatar */}
                                            <Avatar candidate={c} />

                                            {/* Info */}
                                            <div c
                                            lassName="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-[13px] font-semibold text-[#1E293B] truncate">
                                                        {c.name}
                                                    </p>
                                                    {c.code && (
                                                        <span className="shrink-0 rounded bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-semibold text-[#64748B]">
                                                            {c.code}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[12px] text-[#64748B] truncate">
                                                    {c.jobTitle || c.email || ""}
                                                    {c.jobTitle && c.email ? ` · ${c.email}` : ""}
                                                </p>
                                            </div>

                                            {/* Status badge */}
                                            {c.status && (
                                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
                                                    c.onBench
                                                        ? "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]"
                                                        : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]"
                                                }`}>
                                                    {c.onBench ? "On Bench" : c.status}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recruiter Notes */}
                    <div>
                        <label className="mb-1.5 block text-[12px] font-semibold text-[#475569]">
                            Recruiter Notes{" "}
                            <span className="font-normal text-[#94A3B8]">(optional)</span>
                        </label>
                        <textarea
                            value={recruiterNotes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Any notes about this candidate's fit for the role…"
                            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[13px] text-[#1E293B] placeholder-[#CBD5E1] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 resize-none"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-700 flex items-center gap-2">
                            <Icon d={icons.check} size={14} />
                            Candidate submitted successfully!
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="flex shrink-0 items-center justify-between border-t border-[#F1F5F9] px-6 py-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !selectedCandidate || success}
                        className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#1D4ED8] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Submitting…
                            </>
                        ) : (
                            <>
                                <Icon d={icons.submit} size={14} />
                                Submit Candidate
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SubmitToCandidateModal;