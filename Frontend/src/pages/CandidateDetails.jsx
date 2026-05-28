    import React, { useEffect, useState } from "react";
    import { useParams, useNavigate } from "react-router-dom";
    import { getCandidate, toggleBench, deleteCandidate, updateCandidate } from "../api/candidatesApi";
    import { getCandidateSubmissions } from "../api/submissionsApi";
    import { getCandidateInterviews } from "../api/interviewsApi";
    import SubmitToJobModal from "../components/modals/SubmitToJobModal";
    import ScheduleInterviewModal from "../components/modals/ScheduleInterviewModal";
    import useRoleBase from "../hooks/useRoleBase";

    // ─── ICONS ───────────────────────────────────────────────────────────────────

    const Icon = ({ d, size = 16, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d={d} />
    </svg>
    );

    const icons = {
    back:        "M19 12H5M12 19l-7-7 7-7",
    edit:        "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    trash:       "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    mail:        "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
    phone:       "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z",
    pin:         "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10m-3 0a3 3 0 106 0 3 3 0 10-6 0",
    briefcase:   "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    calendar:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    dollar:      "M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
    user:        "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
    document:    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    submit:      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    interview:   "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    bench:       "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    link:        "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
    clock:       "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    check:       "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    x:           "M6 18L18 6M6 6l12 12",
    };

    // ─── STATUS CONFIG ────────────────────────────────────────────────────────────

    const STATUS_CONFIG = {
    New:         { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
    Screening:   { bg: "#FFFBEB", text: "#B45309", dot: "#F59E0B" },
    Shortlisted: { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
    Interview:   { bg: "#F5F3FF", text: "#6D28D9", dot: "#8B5CF6" },
    Offer:       { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
    Hired:       { bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
    Rejected:    { bg: "#FEF2F2", text: "#B91C1C", dot: "#EF4444" },
    "On Hold":   { bg: "#F9FAFB", text: "#374151", dot: "#9CA3AF" },
    Withdrawn:   { bg: "#F9FAFB", text: "#6B7280", dot: "#D1D5DB" },
    };

    const StatusBadge = ({ status }) => {
    const s = status || "New";
    const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.New;
    return (
        <span style={{ background: cfg.bg, color: cfg.text }}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
        style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.dot + "55" }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.dot }} />
        {s}
        </span>
    );
    };

    // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

    const CandidateDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const roleBase = useRoleBase();

    const [candidate, setCandidate] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("profile");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showInterviewModal, setShowInterviewModal] = useState(false);

    useEffect(() => {
        let active = true;
        (async () => {
        try {
            setLoading(true);
            const [candidateData, subsData, ivsData] = await Promise.all([
            getCandidate(id),
            getCandidateSubmissions(id).catch(() => []),
            getCandidateInterviews(id).catch(() => []),
            ]);
            if (active) {
            setCandidate(candidateData);
            setSubmissions(subsData || []);
            setInterviews(ivsData || []);
            }
        } catch (err) {
            console.error(err);
            if (active) setError("Failed to load candidate.");
        } finally {
            if (active) setLoading(false);
        }
        })();
        return () => { active = false; };
    }, [id]);

    const refresh = async () => {
        try { setCandidate(await getCandidate(id)); } catch (e) { console.error(e); }
    };

    const handleToggleBench = async () => {
        try { await toggleBench(id); await refresh(); }
        catch (e) { alert("Failed to update bench status."); }
    };

    const handleStatusChange = async (newStatus) => {
        if (isUpdatingStatus) return;
        setIsUpdatingStatus(true);
        try { await updateCandidate(id, { status: newStatus }); await refresh(); }
        catch (e) { alert("Failed to update status."); }
        finally { setIsUpdatingStatus(false); }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this candidate? This cannot be undone.")) return;
        try { await deleteCandidate(id); navigate(`${roleBase}/candidates`); }
        catch (e) { alert("Failed to delete candidate."); }
    };

    // ── LOADING ──
    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9]">
        <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2563EB]" />
            <span className="text-[13px] text-[#94A3B8]">Loading profile…</span>
        </div>
        </div>
    );

    // ── ERROR ──
    if (error) return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9] p-4">
        <div className="rounded-xl border border-red-200 bg-white px-8 py-6 text-center shadow-sm">
            <div className="text-[15px] font-semibold text-red-600 mb-3">{error}</div>
            <button onClick={() => navigate(`${roleBase}/candidates`)}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8]">
            Back to Candidates
            </button>
        </div>
        </div>
    );

    // ── NOT FOUND ──
    if (!candidate) return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F6F9] p-4">
        <div className="rounded-xl border border-[#E2E8F0] bg-white px-8 py-6 text-center shadow-sm">
            <div className="text-[15px] font-semibold text-[#1E293B] mb-1">Candidate not found</div>
            <p className="text-[13px] text-[#94A3B8] mb-4">This profile doesn't exist.</p>
            <button onClick={() => navigate(`${roleBase}/candidates`)}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8]">
            Back to Candidates
            </button>
        </div>
        </div>
    );

    const fullAddress = [candidate.street, candidate.city, candidate.state, candidate.country, candidate.pincode]
        .filter(Boolean).join(", ");

    const statusOptions = ["New","Screening","Shortlisted","Interview","Offer","Hired","Rejected","On Hold","Withdrawn"];

    return (
        <div className="min-h-screen bg-[#F4F6F9]">

        {/* ═══════════════ TOP HEADER BAR ═══════════════ */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E2E8F0] shadow-sm">

            {/* Row 1: Back + Identity + Actions */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-[#F1F5F9]">

            {/* Back */}
            <button onClick={() => navigate(`${roleBase}/candidates`)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC] transition shrink-0">
                <Icon d={icons.back} size={15} />
            </button>

            {/* Avatar + Name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center text-white text-[16px] font-bold shadow">
                {candidate.initials || "?"}
                </div>
                <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-[17px] font-bold text-[#1E293B] leading-tight truncate">
                    {candidate.name || "Unnamed Candidate"}
                    </h1>
                    <StatusBadge status={candidate.status} />
                    {candidate.onBench && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-0.5 text-[11px] font-semibold text-[#1D4ED8]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                        On Bench
                    </span>
                    )}
                </div>
                {candidate.jobTitle && (
                    <p className="text-[12px] text-[#64748B] mt-0.5">{candidate.jobTitle}</p>
                )}
                </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
                <button onClick={handleToggleBench}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition ${
                    candidate.onBench
                    ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]"
                    : "border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]"
                }`}>
                <Icon d={icons.bench} size={13} />
                {candidate.onBench ? "Remove from Bench" : "Add to Bench"}
                </button>
                <button onClick={() => navigate(`${roleBase}/candidates/edit/${id}`)}
                className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                <Icon d={icons.edit} size={13} />
                Edit
                </button>
                <button onClick={handleDelete}
                className="flex items-center gap-1.5 rounded-lg border border-[#FECACA] bg-white px-3 py-1.5 text-[12px] font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition">
                <Icon d={icons.trash} size={13} />
                Delete
                </button>
            </div>
            </div>

            {/* Row 2: Tabs */}
            <div className="flex items-center gap-0 px-6">
            {[
                { id: "profile",     label: "Profile Info" },
                { id: "submissions", label: "Submissions"  },
                { id: "interviews",  label: "Interviews"   },
            ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-[13px] font-medium border-b-2 transition ${
                    activeTab === tab.id
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC]"
                }`}>
                {tab.label}
                </button>
            ))}
            </div>
        </div>

        {/* ═══════════════ MAIN LAYOUT ═══════════════ */}
        <div className="flex gap-0 h-full">

            {/* ── LEFT / MAIN CONTENT ── */}
            <div className="flex-1 min-w-0 p-6 space-y-5 overflow-auto">

            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
                <>
                {/* Summary Card - KEY CEIPAL ELEMENT: top card with all quick info */}
                <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
                    <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">Summary</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-[#F1F5F9]">
                    <SummaryCell label="Current Title" value={candidate.jobTitle} />
                    <SummaryCell label="Experience" value={candidate.experienceYears ? `${candidate.experienceYears} Years` : null} />
                    <SummaryCell label="Expected Salary" value={fmtMoney(candidate.expectedSalary)} />
                    <SummaryCell label="Notice Period" value={candidate.noticePeriod} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-[#F1F5F9] border-t border-[#F1F5F9]">
                    <SummaryCell label="Current Salary" value={fmtMoney(candidate.currentSalary)} />
                    <SummaryCell label="Qualification" value={candidate.qualification} />
                    <SummaryCell label="Status" value={<StatusBadge status={candidate.status} />} isNode />
                    <SummaryCell label="On Bench" value={candidate.onBench ? "Yes" : "No"} />
                    </div>
                </div>

                {/* Contact Information */}
                <CeipalCard title="Contact Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldRow icon={icons.mail}  label="Email"   value={candidate.email}
                        link={candidate.email ? `mailto:${candidate.email}` : null} />
                    <FieldRow icon={icons.phone} label="Phone"   value={candidate.phone}
                        link={candidate.phone ? `tel:${candidate.phone}` : null} />
                    {fullAddress && (
                        <div className="col-span-2">
                        <FieldRow icon={icons.pin} label="Address" value={fullAddress} />
                        </div>
                    )}
                    {candidate.linkedin && (
                        <div className="col-span-2">
                        <FieldRow icon={icons.link} label="LinkedIn" value="View LinkedIn Profile"
                            link={candidate.linkedin} />
                        </div>
                    )}
                    </div>
                </CeipalCard>

                {/* Skills */}
                {candidate.skills && (
                    <CeipalCard title="Skills">
                    <div className="flex flex-wrap gap-2">
                        {String(candidate.skills).split(",").map((s, i) => {
                        const t = s.trim();
                        if (!t) return null;
                        return (
                            <span key={i}
                            className="rounded-md border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1 text-[12px] font-medium text-[#1D4ED8]">
                            {t}
                            </span>
                        );
                        })}
                    </div>
                    </CeipalCard>
                )}

                {/* Work Experience */}
                {Array.isArray(candidate.experience) && candidate.experience.some(hasContent) && (
                    <CeipalCard title="Work Experience">
                    <div className="divide-y divide-[#F1F5F9]">
                        {candidate.experience.filter(hasContent).map((exp, i) => (
                        <TimelineItem key={i}
                            title={exp.title || "Untitled Role"}
                            sub={exp.company}
                            duration={fmtDuration(exp.fromMonth, exp.fromYear, exp.toMonth, exp.toYear, exp.current)}
                            description={exp.summary}
                            color="#3B82F6"
                        />
                        ))}
                    </div>
                    </CeipalCard>
                )}

                {/* Education */}
                {Array.isArray(candidate.education) && candidate.education.some(hasContent) && (
                    <CeipalCard title="Education">
                    <div className="divide-y divide-[#F1F5F9]">
                        {candidate.education.filter(hasContent).map((edu, i) => (
                        <TimelineItem key={i}
                            title={edu.degree || "Degree"}
                            sub={[edu.institute, edu.major].filter(Boolean).join(" · ")}
                            duration={fmtDuration(edu.fromMonth, edu.fromYear, edu.toMonth, edu.toYear, edu.pursuing)}
                            color="#10B981"
                        />
                        ))}
                    </div>
                    </CeipalCard>
                )}

                {/* Personal & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <CeipalCard title="Personal Information">
                    <div className="space-y-3">
                        <KV label="First Name"  value={candidate.firstName} />
                        <KV label="Last Name"   value={candidate.lastName} />
                        <KV label="Email"       value={candidate.email} />
                        <KV label="Phone"       value={candidate.phone} />
                    </div>
                    </CeipalCard>
                    {fullAddress && (
                    <CeipalCard title="Address">
                        <div className="space-y-3">
                        <KV label="Street"  value={candidate.street} />
                        <KV label="City"    value={candidate.city} />
                        <KV label="State"   value={candidate.state} />
                        <KV label="Country" value={candidate.country} />
                        <KV label="Pincode" value={candidate.pincode} />
                        </div>
                    </CeipalCard>
                    )}
                </div>

                {/* Attachments */}
                {candidate.attachments && Object.values(candidate.attachments).some(Boolean) && (
                    <CeipalCard title="Attachments">
                    <div className="space-y-2">
                        {Object.entries(candidate.attachments).map(([key, file]) => {
                        if (!file) return null;
                        return (
                            <div key={key}
                            className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#3B82F6]">
                                <Icon d={icons.document} size={15} />
                            </div>
                            <div>
                                <p className="text-[12px] font-semibold text-[#1E293B]">
                                {key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                                </p>
                                <p className="text-[11px] text-[#94A3B8]">{file.name || "File"}</p>
                            </div>
                            </div>
                        );
                        })}
                    </div>
                    </CeipalCard>
                )}
                </>
            )}

            {/* ── SUBMISSIONS TAB ── */}
            {activeTab === "submissions" && (
                <SubmissionsTab submissions={submissions} />
            )}

            {/* ── INTERVIEWS TAB ── */}
            {activeTab === "interviews" && (
                <InterviewsTab interviews={interviews} />
            )}
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="w-[260px] shrink-0 border-l border-[#E2E8F0] bg-white flex flex-col">

            {/* Quick Actions Section */}
            <div className="border-b border-[#F1F5F9] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Quick Actions</p>
                <div className="space-y-2">

                {/* Submit to Job - PRIMARY */}
                <button onClick={() => setShowSubmitModal(true)}
                    className="w-full flex items-center gap-2.5 rounded-lg bg-[#2563EB] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1D4ED8] transition shadow-sm">
                    <Icon d={icons.submit} size={15} />
                    Submit to Job
                </button>

                {/* Schedule Interview */}
                <button onClick={() => setShowInterviewModal(true)}
                    className="w-full flex items-center gap-2.5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition">
                    <Icon d={icons.interview} size={15} />
                    Schedule Interview
                </button>

                {/* Add to Bench - your feature */}
                <button onClick={handleToggleBench}
                    className={`w-full flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition ${
                    candidate.onBench
                        ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]"
                        : "border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]"
                    }`}>
                    <Icon d={icons.bench} size={15} />
                    {candidate.onBench ? "Remove from Bench" : "Add to Bench"}
                </button>

                </div>
            </div>

            {/* Change Status Section */}
            <div className="border-b border-[#F1F5F9] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Submission Status</p>
                <div className="mb-2">
                <StatusBadge status={candidate.status} />
                </div>
                <select
                value={candidate.status || "New"}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[12px] font-medium text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50"
                >
                {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                ))}
                </select>
            </div>

            {/* Quick Info Section */}
            <div className="border-b border-[#F1F5F9] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Quick Info</p>
                <div className="space-y-2.5">
                <SidebarKV label="Experience"
                    value={candidate.experienceYears ? `${candidate.experienceYears} yrs` : null} />
                <SidebarKV label="Expected"    value={fmtMoney(candidate.expectedSalary)} />
                <SidebarKV label="Current"     value={fmtMoney(candidate.currentSalary)} />
                <SidebarKV label="Notice"      value={candidate.noticePeriod} />
                <SidebarKV label="Qualify"     value={candidate.qualification} />
                </div>
            </div>

            {/* Contact Section */}
            <div className="p-4 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Contact</p>
                <div className="space-y-2.5">
                {candidate.email && (
                    <a href={`mailto:${candidate.email}`}
                    className="flex items-center gap-2 text-[12px] text-[#3B82F6] hover:text-[#1D4ED8] truncate">
                    <Icon d={icons.mail} size={13} className="text-[#94A3B8] shrink-0" />
                    <span className="truncate">{candidate.email}</span>
                    </a>
                )}
                {candidate.phone && (
                    <a href={`tel:${candidate.phone}`}
                    className="flex items-center gap-2 text-[12px] text-[#3B82F6] hover:text-[#1D4ED8]">
                    <Icon d={icons.phone} size={13} className="text-[#94A3B8] shrink-0" />
                    {candidate.phone}
                    </a>
                )}
                {(candidate.city || candidate.country) && (
                    <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                    <Icon d={icons.pin} size={13} className="text-[#94A3B8] shrink-0" />
                    {[candidate.city, candidate.country].filter(Boolean).join(", ")}
                    </div>
                )}
                {candidate.linkedin && (
                    <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[12px] text-[#3B82F6] hover:text-[#1D4ED8]">
                    <Icon d={icons.link} size={13} className="text-[#94A3B8] shrink-0" />
                    LinkedIn Profile
                    </a>
                )}
                </div>
            </div>

            </div>
        </div>

        {/* ═══════════════ MODALS ═══════════════ */}
        {showSubmitModal && (
            <SubmitToJobModal
            candidate={candidate}
            onClose={() => setShowSubmitModal(false)}
            onSuccess={async () => {
                // Refresh submissions list after successful submit
                const fresh = await getCandidateSubmissions(id).catch(() => []);
                setSubmissions(fresh || []);
                setActiveTab("submissions");
            }}
            />
        )}

        {showInterviewModal && (
            <ScheduleInterviewModal
            candidate={candidate}
            onClose={() => setShowInterviewModal(false)}
            onSuccess={async () => {
                // Refresh interviews list after successful schedule
                const fresh = await getCandidateInterviews(id).catch(() => []);
                setInterviews(fresh || []);
                setActiveTab("interviews");
            }}
            />
        )}
        </div>
    );
    };

    // ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

    const CeipalCard = ({ title, children }) => (
    <div className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">{title}</span>
        </div>
        <div className="p-5">{children}</div>
    </div>
    );

    const SummaryCell = ({ label, value, isNode = false }) => (
    <div className="px-5 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8] mb-1">{label}</p>
        {isNode
        ? <div>{value}</div>
        : <p className="text-[13px] font-semibold text-[#1E293B]">{value || "—"}</p>
        }
    </div>
    );

    const FieldRow = ({ icon, label, value, link }) => {
    const content = (
        <div className="flex items-start gap-3">
        <div className="mt-0.5 text-[#94A3B8] shrink-0">
            <Icon d={icon} size={15} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8] mb-0.5">{label}</p>
            <p className={`text-[13px] font-medium truncate ${link ? "text-[#2563EB] hover:text-[#1D4ED8]" : "text-[#1E293B]"}`}>
            {value || "—"}
            </p>
        </div>
        </div>
    );
    if (link) return <a href={link} target={label === "LinkedIn" ? "_blank" : undefined} rel="noopener noreferrer">{content}</a>;
    return content;
    };

    const KV = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4">
        <span className="text-[12px] text-[#94A3B8] shrink-0">{label}</span>
        <span className="text-[12px] font-semibold text-[#1E293B] text-right">{value || "—"}</span>
    </div>
    );

    const SidebarKV = ({ label, value }) => (
    <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-[#94A3B8]">{label}</span>
        <span className="text-[11px] font-semibold text-[#1E293B] text-right truncate max-w-[140px]">{value || "—"}</span>
    </div>
    );

    const TimelineItem = ({ title, sub, duration, description, color }) => (
    <div className="flex gap-4 py-4 first:pt-0 last:pb-0">
        <div className="flex flex-col items-center shrink-0 w-5">
        <div className="h-2.5 w-2.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
        <div className="flex-1 w-px mt-1" style={{ background: color + "30" }} />
        </div>
        <div className="flex-1 pb-1">
        <p className="text-[13px] font-semibold text-[#1E293B]">{title}</p>
        {sub && <p className="text-[12px] text-[#64748B] mt-0.5">{sub}</p>}
        {duration && <p className="text-[11px] font-medium text-[#94A3B8] mt-1 uppercase tracking-wide">{duration}</p>}
        {description && <p className="text-[12px] text-[#64748B] mt-2 leading-relaxed">{description}</p>}
        </div>
    </div>
    );

    const SubmissionsTab = ({ submissions }) => {
    if (!Array.isArray(submissions) || submissions.length === 0) return (
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-12 text-center shadow-sm">
        <Icon d={icons.document} size={40} className="mx-auto text-[#CBD5E1] mb-4" />
        <p className="text-[15px] font-semibold text-[#1E293B]">No submissions yet</p>
        <p className="text-[13px] text-[#94A3B8] mt-1">This candidate hasn't been submitted to any jobs.</p>
        </div>
    );

    return (
        <div className="space-y-3">
        {submissions.map((s) => (
            <div key={s.id} className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                <p className="text-[14px] font-semibold text-[#1E293B]">{s.jobTitle || "Untitled Job"}</p>
                <p className="text-[12px] text-[#64748B] mt-0.5">{s.clientName || "—"}</p>
                <p className="text-[11px] text-[#94A3B8] mt-2">Submitted: {fmtDate(s.submittedDate)}</p>
                </div>
                <StatusBadge status={s.status} />
            </div>
            {s.recruiterNotes && (
                <div className="mt-3 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9] p-3">
                <p className="text-[11px] font-semibold text-[#94A3B8] mb-1">NOTES</p>
                <p className="text-[12px] text-[#475569]">{s.recruiterNotes}</p>
                </div>
            )}
            </div>
        ))}
        </div>
    );
    };

    const InterviewsTab = ({ interviews }) => {
    if (!Array.isArray(interviews) || interviews.length === 0) return (
        <div className="rounded-xl bg-white border border-[#E2E8F0] p-12 text-center shadow-sm">
        <Icon d={icons.calendar} size={40} className="mx-auto text-[#CBD5E1] mb-4" />
        <p className="text-[15px] font-semibold text-[#1E293B]">No interviews scheduled</p>
        <p className="text-[13px] text-[#94A3B8] mt-1">No interviews have been scheduled yet.</p>
        </div>
    );

    return (
        <div className="space-y-3">
        {interviews.map((iv) => (
            <div key={iv.id} className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                <p className="text-[14px] font-semibold text-[#1E293B]">{iv.jobTitle || "Untitled Job"}</p>
                <p className="text-[12px] text-[#64748B] mt-0.5">{iv.interviewRound}</p>
                <div className="flex gap-4 mt-2 text-[11px] text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                    <Icon d={icons.calendar} size={12} /> {fmtDate(iv.scheduledDate)} {iv.scheduledTime && `at ${iv.scheduledTime}`}
                    </span>
                    <span className="flex items-center gap-1">
                    <Icon d={icons.clock} size={12} /> {iv.duration || "—"} min
                    </span>
                </div>
                </div>
                <StatusBadge status={iv.status} />
            </div>
            </div>
        ))}
        </div>
    );
    };

    const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
        <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] px-6 py-4">
            <h3 className="text-[15px] font-semibold text-[#1E293B]">{title}</h3>
            <button onClick={onClose} className="text-[#94A3B8] hover:text-[#475569]">
            <Icon d={icons.x} size={18} />
            </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        </div>
    </div>
    );

    // ─── UTILITIES ────────────────────────────────────────────────────────────────

    const hasContent = (obj) =>
    obj && Object.values(obj).some((v) => v !== undefined && v !== null && v !== "" && v !== false);

    const fmtMoney = (n) => {
    if (!n) return null;
    const num = Number(n);
    if (Number.isNaN(num)) return n;
    return `₹${num.toLocaleString("en-IN")}`;
    };

    const fmtDuration = (fm, fy, tm, ty, ongoing) => {
    const from = [fm, fy].filter(Boolean).join(" ");
    const to = ongoing ? "Present" : [tm, ty].filter(Boolean).join(" ");
    if (!from && !to) return null;
    return `${from || "—"} → ${to || "—"}`;
    };

    const fmtDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
    catch { return "—"; }
    };

    export default CandidateDetails;