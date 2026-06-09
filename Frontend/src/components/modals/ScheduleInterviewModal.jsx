import React, { useEffect, useState } from "react";
import { listJobs } from "../../api/jobsApi";
import { getCandidateSubmissions } from "../../api/submissionsApi";
import { createInterview } from "../../api/interviewsApi";

const Icon = ({ d, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

const icons = {
    x:        "M6 18L18 6M6 6l12 12",
    calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    check:    "M5 13l4 4L19 7",
    search:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    link:     "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
};

const INTERVIEW_TYPES  = ["Phone Screen", "Video Call", "In Person", "Technical", "HR Round", "Panel", "Final Round"];
const INTERVIEW_ROUNDS = ["L1", "L2", "L3", "L4", "Final"];

const inputClass   = "w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[13px] text-[#1E293B] placeholder-[#CBD5E1] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20";
const selectClass  = "w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[13px] text-[#1E293B] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20";

const FormField = ({ label, required, hint, children }) => (
    <div>
        <label className="mb-1.5 block text-[12px] font-semibold text-[#475569]">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
            {hint && <span className="ml-1 font-normal text-[#94A3B8]">({hint})</span>}
        </label>
        {children}
    </div>
);

const ScheduleInterviewModal = ({ candidate, preselectedJob, onClose, onSuccess }) => {

    const [jobs,         setJobs]         = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [jobSearch,    setJobSearch]    = useState("");
    const [selectedJob,  setSelectedJob]  = useState(preselectedJob || null);
    const [loadingJobs,  setLoadingJobs]  = useState(!preselectedJob);

    // Submission linked to selected job (for auto status-advance)
    const [linkedSubmission, setLinkedSubmission] = useState(null);

    const [form, setForm] = useState({
        interviewRound: "L1",
        interviewType:  "Phone Screen",
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

    // Fetch open jobs
    useEffect(() => {
        if (preselectedJob) return;
        (async () => {
            try {
                setLoadingJobs(true);
                const allJobs = await listJobs();
                const open    = allJobs.filter((j) => j.status === "Open");
                setJobs(open);
                setFilteredJobs(open);
            } catch (e) {
                console.error(e);
                setError("Failed to load jobs.");
            } finally {
                setLoadingJobs(false);
            }
        })();
    }, [preselectedJob]);

    // Filter jobs
    useEffect(() => {
        if (!jobSearch.trim()) { setFilteredJobs(jobs); return; }
        const q = jobSearch.toLowerCase();
        setFilteredJobs(jobs.filter((j) =>
            j.title?.toLowerCase().includes(q) || j.client?.toLowerCase().includes(q)
        ));
    }, [jobSearch, jobs]);

    // When job selected, try to find an existing submission to link
    useEffect(() => {
        if (!selectedJob || !candidate) return;
        (async () => {
            try {
                const subs = await getCandidateSubmissions(candidate.id || candidate._id);
                const match = subs.find((s) => {
                    const jobId = s.job?._id || s.job?.id || s.job;
                    return jobId === (selectedJob.id || selectedJob._id);
                });
                setLinkedSubmission(match || null);
            } catch {
                setLinkedSubmission(null);
            }
        })();
    }, [selectedJob, candidate]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError("");
    };

    const handleSchedule = async () => {
        if (!form.scheduledDate) { setError("Please select a date."); return; }
        if (!form.scheduledTime) { setError("Please select a time."); return; }

        setSubmitting(true);
        setError("");

        try {
            const interviewersArr = form.interviewers
                ? form.interviewers.split(",").map((s) => s.trim()).filter(Boolean)
                : [];

            await createInterview({
                candidateId:    candidate.id || candidate._id,
                jobId:          selectedJob.id || selectedJob._id,
                submissionId:   linkedSubmission?.id || linkedSubmission?._id || undefined,
                interviewRound: form.interviewRound,
                interviewType:  form.interviewType,
                scheduledDate:  form.scheduledDate,
                scheduledTime:  form.scheduledTime,
                duration:       Number(form.duration) || 60,
                meetingLink:    form.meetingLink.trim(),
                location:       form.location.trim(),
                interviewers:   interviewersArr,
                notes:          form.notes.trim(),
            });

            setSuccess(true);
            setTimeout(() => { onSuccess && onSuccess(); onClose(); }, 1500);

        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to schedule interview.");
        } finally {
            setSubmitting(false);
        }
    };

    const candidateName = candidate.name || `${candidate.firstName} ${candidate.lastName}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#F1F5F9] px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0FDF4] text-[#16A34A]">
                            <Icon d={icons.calendar} size={17} />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-[#1E293B]">Schedule Interview</h2>
                            <p className="text-[12px] text-[#94A3B8]">{candidateName}</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] transition">
                        <Icon d={icons.x} size={17} />
                    </button>
                </div>

                {/* Step indicator */}
                {!preselectedJob && (
                    <div className="flex border-b border-[#F1F5F9]">
                        {["Select Job", "Interview Details"].map((label, i) => (
                            <div key={i} className={`flex-1 py-3 text-center text-[12px] font-semibold border-b-2 transition ${
                                step === i + 1 ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#94A3B8]"
                            }`}>
                                {i + 1}. {label}
                            </div>
                        ))}
                    </div>
                )}

                {/* Content */}
                <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">

                    {/* STEP 1: SELECT JOB */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#94A3B8]">
                                    <Icon d={icons.search} size={15} />
                                </div>
                                <input type="text" placeholder="Search job or client…"
                                    value={jobSearch} onChange={(e) => setJobSearch(e.target.value)}
                                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 pl-9 pr-4 text-[13px] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                                />
                            </div>

                            {loadingJobs ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2563EB]" />
                                </div>
                            ) : filteredJobs.length === 0 ? (
                                <div className="rounded-lg bg-[#F8FAFC] py-8 text-center">
                                    <p className="text-[13px] text-[#94A3B8]">No open jobs found</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                                    {filteredJobs.map((job) => (
                                        <button key={job.id}
                                            onClick={() => { setSelectedJob(job); setError(""); }}
                                            className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                                                selectedJob?.id === job.id
                                                    ? "border-[#2563EB] bg-[#EFF6FF]"
                                                    : "border-[#E2E8F0] hover:border-[#BFDBFE] hover:bg-[#F8FAFC]"
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                                                    selectedJob?.id === job.id ? "border-[#2563EB] bg-[#2563EB]" : "border-[#CBD5E1]"
                                                }`}>
                                                    {selectedJob?.id === job.id && <Icon d={icons.check} size={10} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-semibold text-[#1E293B] truncate">{job.title}</p>
                                                    <p className="text-[12px] text-[#64748B]">{job.client}{job.city && ` · ${job.city}`}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: INTERVIEW DETAILS */}
                    {step === 2 && (
                        <div className="space-y-4">
                            {/* Job summary */}
                            <div className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">For Job</p>
                                <p className="text-[13px] font-bold text-[#1E293B]">{selectedJob?.title}</p>
                                <p className="text-[12px] text-[#64748B]">{selectedJob?.client}</p>
                            </div>

                            {/* Linked submission banner */}
                            {linkedSubmission && (
                                <div className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 flex items-center gap-2 text-[12px] text-[#065F46]">
                                    <Icon d={icons.link} size={14} />
                                    <span>Linked to submission (status will auto-update)</span>
                                </div>
                            )}

                            {/* Round + Type */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Interview Round" required>
                                    <select value={form.interviewRound}
                                        onChange={(e) => handleChange("interviewRound", e.target.value)}
                                        className={selectClass}>
                                        {INTERVIEW_ROUNDS.map((r) => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Interview Type" required>
                                    <select value={form.interviewType}
                                        onChange={(e) => handleChange("interviewType", e.target.value)}
                                        className={selectClass}>
                                        {INTERVIEW_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </FormField>
                            </div>

                            {/* Date + Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Date" required>
                                    <input type="date" value={form.scheduledDate}
                                        onChange={(e) => handleChange("scheduledDate", e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                        className={inputClass} />
                                </FormField>
                                <FormField label="Time" required>
                                    <input type="time" value={form.scheduledTime}
                                        onChange={(e) => handleChange("scheduledTime", e.target.value)}
                                        className={inputClass} />
                                </FormField>
                            </div>

                            {/* Duration */}
                            <FormField label="Duration (minutes)">
                                <input type="number" value={form.duration}
                                    onChange={(e) => handleChange("duration", e.target.value)}
                                    min={15} max={480} step={15} className={inputClass} />
                            </FormField>

                            {/* Meeting Link */}
                            <FormField label="Meeting Link">
                                <input type="url" value={form.meetingLink}
                                    onChange={(e) => handleChange("meetingLink", e.target.value)}
                                    placeholder="https://meet.google.com/…" className={inputClass} />
                            </FormField>

                            {/* Location */}
                            <FormField label="Location">
                                <input type="text" value={form.location}
                                    onChange={(e) => handleChange("location", e.target.value)}
                                    placeholder="Office address or 'Remote'" className={inputClass} />
                            </FormField>

                            {/* Interviewers */}
                            <FormField label="Interviewers" hint="Comma-separated">
                                <input type="text" value={form.interviewers}
                                    onChange={(e) => handleChange("interviewers", e.target.value)}
                                    placeholder="John Smith, Jane Doe" className={inputClass} />
                            </FormField>

                            {/* Notes */}
                            <FormField label="Notes">
                                <textarea value={form.notes}
                                    onChange={(e) => handleChange("notes", e.target.value)}
                                    rows={3} placeholder="Any additional notes…"
                                    className={`${inputClass} resize-none`} />
                            </FormField>

                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
                            )}
                            {success && (
                                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-700 flex items-center gap-2">
                                    <Icon d={icons.check} size={14} />
                                    Interview scheduled! Submission status auto-updated.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-[#F1F5F9] px-6 py-4">
                    {step === 1 ? (
                        <>
                            <button onClick={onClose}
                                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                                Cancel
                            </button>
                            <button
                                onClick={() => { if (!selectedJob) { setError("Please select a job first."); return; } setError(""); setStep(2); }}
                                disabled={!selectedJob}
                                className="rounded-lg bg-[#2563EB] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#1D4ED8] transition disabled:opacity-50">
                                Next →
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => { if (!preselectedJob) setStep(1); setError(""); }}
                                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                                {preselectedJob ? "Cancel" : "← Back"}
                            </button>
                            <button
                                onClick={handleSchedule}
                                disabled={submitting || success}
                                className="flex items-center gap-2 rounded-lg bg-[#16A34A] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#15803D] transition disabled:opacity-50 disabled:cursor-not-allowed">
                                {submitting ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Scheduling…
                                    </>
                                ) : (
                                    <>
                                        <Icon d={icons.calendar} size={14} />
                                        Schedule Interview
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ScheduleInterviewModal;