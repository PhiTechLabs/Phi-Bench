import React, { useEffect, useState } from "react";
import { listJobs } from "../../api/jobsApi";
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
    brief:   "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
};

const SubmitToJobModal = ({ candidate, onClose, onSuccess }) => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedJob, setSelectedJob] = useState(null);
    const [recruiterNotes, setRecruiterNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Fetch open jobs on mount
    useEffect(() => {
         
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const allJobs = await listJobs();
                const openJobs = allJobs.filter((j) => j.status === "Open");
                setJobs(openJobs);
                setFilteredJobs(openJobs);
            } catch (err) {
                console.error(err);
                setError("Failed to load jobs.");
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    // Filter jobs by search
    useEffect(() => {
        if (!search.trim()) {
            setFilteredJobs(jobs);
            return;
        }
        const q = search.toLowerCase();
        setFilteredJobs(
            jobs.filter(
                (j) =>
                    j.title?.toLowerCase().includes(q) ||
                    j.client?.toLowerCase().includes(q) ||
                    j.city?.toLowerCase().includes(q)
            )
        );
    }, [search, jobs]);

    const handleSubmit = async () => {
        if (!selectedJob) {
            setError("Please select a job to submit to.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            await createSubmission({
                candidateId:    candidate.id || candidate._id,
                jobId:          selectedJob.id || selectedJob._id,
                recruiterNotes: recruiterNotes.trim(),
            });

            setSuccess(true);

            // Auto-close after 1.5s and notify parent
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden">

                {/* ── Header ── */}
                <div className="flex items-center justify-between border-b border-[#F1F5F9] px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                            <Icon d={icons.submit} size={17} />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-[#1E293B]">Submit to Job</h2>
                            <p className="text-[12px] text-[#94A3B8]">{candidate.name || `${candidate.firstName} ${candidate.lastName}`}</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition">
                        <Icon d={icons.x} size={17} />
                    </button>
                </div>

                {/* ── Content ── */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* Search bar */}
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#94A3B8]">
                            <Icon d={icons.search} size={15} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by job title, client, or city…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-9 pr-4 text-[13px] text-[#1E293B] placeholder-[#CBD5E1] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                        />
                    </div>

                    {/* Job list */}
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2563EB]" />
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="rounded-lg bg-[#F8FAFC] py-8 text-center">
                            <p className="text-[13px] text-[#94A3B8]">No open jobs found</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
                                Select a job ({filteredJobs.length} open)
                            </p>
                            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                                {filteredJobs.map((job) => (
                                    <button
                                        key={job.id}
                                        onClick={() => {
                                            setSelectedJob(job);
                                            setError("");
                                        }}
                                        className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                                            selectedJob?.id === job.id
                                                ? "border-[#2563EB] bg-[#EFF6FF]"
                                                : "border-[#E2E8F0] bg-white hover:border-[#BFDBFE] hover:bg-[#F8FAFC]"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                                    selectedJob?.id === job.id
                                                        ? "border-[#2563EB] bg-[#2563EB]"
                                                        : "border-[#CBD5E1] bg-white"
                                                }`}>
                                                    {selectedJob?.id === job.id && (
                                                        <Icon d={icons.check} size={10} />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-semibold text-[#1E293B] truncate">
                                                        {job.title}
                                                    </p>
                                                    <p className="text-[12px] text-[#64748B]">
                                                        {job.client}
                                                        {job.city && ` · ${job.city}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex flex-col items-end gap-1">
                                                <span className="rounded-full bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 text-[11px] font-semibold text-[#065F46]">
                                                    Open
                                                </span>
                                                {job.jobType && (
                                                    <span className="text-[11px] text-[#94A3B8]">{job.jobType}</span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recruiter Notes */}
                    <div>
                        <label className="mb-1.5 block text-[12px] font-semibold text-[#475569]">
                            Recruiter Notes <span className="font-normal text-[#94A3B8]">(optional)</span>
                        </label>
                        <textarea
                            value={recruiterNotes}
                            onChange={(e) => setRecruiterNotes(e.target.value)}
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
                <div className="flex items-center justify-between border-t border-[#F1F5F9] px-6 py-4">
                    <button onClick={onClose}
                        className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !selectedJob || success}
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

export default SubmitToJobModal;