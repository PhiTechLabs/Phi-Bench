    import React, { useEffect, useState } from "react";
    import { useParams, useNavigate } from "react-router-dom";
    import { getCandidate, toggleBench, deleteCandidate } from "../api/candidatesApi";
    import useRoleBase from "../hooks/useRoleBase";

    /* ──────────────────── MAIN COMPONENT ──────────────────── */

    const CandidateDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading]     = useState(true);
    const roleBase = useRoleBase();
    const [error, setError] = useState("");

    // useEffect(() => {
    //     let active = true;
    //     (async () => {
    //     const data = await getCandidate(id);
    //     if (active) {
    //         setCandidate(data);
    //         setLoading(false);
    //     }
    //     })();
    //     return () => { active = false; };
    // }, [id]);

    useEffect(() => {
        let active = true;

        const fetchCandidate = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getCandidate(id);

                if (active) {
                    setCandidate(data);
                }

            } catch (err) {
                console.error(err);

                if (active) {
                    setError("Failed to load candidate profile.");
                }

            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchCandidate();

        return () => {
            active = false;
        };
    }, [id]);

    // const refresh = async () => {
    //     const data = await getCandidate(id);
    //     setCandidate(data);
    // };

    const refresh = async () => {
        try {
            const data = await getCandidate(id);
            setCandidate(data);
        } catch (err) {
            console.error(err);
            setError("Failed to refresh candidate.");
        }
    };

    const handleToggleBench = async () => {
        try {
            await toggleBench(id);
            await refresh();
        } catch (err) {
            console.error(err);
            alert("Failed to update bench status.");
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Delete this candidate? This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            await deleteCandidate(id);
            navigate(`${roleBase}/candidates`);
        } catch (err) {
            console.error(err);
            alert("Failed to delete candidate.");
        }
    };

    if (loading) {
        return (
        <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0]">
            <div className="text-[13px] text-[#9B9890]">Loading…</div>
        </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0]">
                <div className="rounded-2xl border border-[#FECACA] bg-white px-6 py-5 text-center shadow-sm">
                    <div className="text-[15px] font-semibold text-[#B91C1C]">
                        {error}
                    </div>

                    <button
                        onClick={() => navigate(`${roleBase}/candidates`)}
                        className="mt-4 rounded-[10px] bg-[#1C4ED8] px-4 py-2 text-[13px] font-medium text-white"
                    >
                        Back to Candidates
                    </button>
                </div>
            </div>
        );
    }

    if (!candidate) {
        return (
        <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0]">
            <div className="rounded-2xl border border-[#E8E6E0] bg-white p-8 text-center">
            <div className="text-[16px] font-semibold text-[#1C1B18]">Candidate not found</div>
            <p className="mt-1 text-[13px] text-[#9B9890]">The profile you're looking for doesn't exist.</p>
            <button onClick={() => navigate(`${roleBase}/candidates`)} className="mt-4 rounded-[10px] bg-[#1C4ED8] px-4 py-2 text-[13px] font-medium text-white">
                Back to Candidates
            </button>
            </div>
        </div>
        );
    }

    const fullAddress = [candidate.street, candidate.city, candidate.state, candidate.country, candidate.pincode].filter(Boolean).join(", ");

    return (
        <div className="min-h-screen bg-[#F5F4F0] font-sans">
        <div className="sticky top-0 z-50 border-b border-[#E8E6E0] bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
            <div className="flex items-center gap-5">
                <button onClick={() => navigate(`${roleBase}/candidates`)} className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E0DDD6] bg-white text-lg text-[#6B6860] transition-all hover:bg-[#F5F4F0]">
                ←
                </button>
                <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9B9890]">PhiBench · Candidate Profile</div>
                <div className="text-[18px] font-semibold leading-tight text-[#1C1B18]">{candidate.name || "Unnamed Candidate"}</div>
                </div>
            </div>
            <div className="flex items-center gap-2.5">
                <button onClick={handleToggleBench} className={`flex h-10 items-center gap-2 rounded-[10px] border px-4 text-[13px] font-medium transition-all ${candidate.onBench ? "border-[#1C4ED8] bg-[#EFF6FF] text-[#1C4ED8]" : "border-[#E0DDD6] bg-white text-[#4A4845] hover:bg-[#F5F4F0]"}`}>
                <span className={`h-2 w-2 rounded-full ${candidate.onBench ? "bg-[#1C4ED8]" : "bg-[#C8C5BD]"}`} />
                {candidate.onBench ? "On Bench" : "Add to Bench"}
                </button>
                <button onClick={handleDelete} className="flex h-10 items-center gap-1.5 rounded-[10px] border border-[#FECACA] bg-white px-4 text-[13px] font-medium text-[#DC2626] transition-all hover:bg-[#FEF2F2]">
                Delete
                </button>
            </div>
            </div>
        </div>

        <div className="mx-auto max-w-7xl px-8 py-8">
            <div className="mb-5 overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white">
            <div className="flex flex-wrap items-center gap-6 p-7">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#1C4ED8] to-[#4F6FE8] text-[26px] font-semibold text-white shadow-[0_4px_12px_rgba(28,78,216,0.3)]">
                {candidate.initials || "?"}
                </div>
                <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-[24px] font-semibold leading-tight text-[#1C1B18]">{candidate.name || "Unnamed"}</h1>
                    <StatusBadge status={candidate.status} />
                    {candidate.onBench && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-0.5 text-[11px] font-medium text-[#1D4ED8]">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        On Bench
                    </span>
                    )}
                </div>
                {candidate.jobTitle && <p className="mt-1 text-[14px] text-[#4A4845]">{candidate.jobTitle}</p>}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-[#6B6860]">
                    {candidate.email && <ContactLine icon="mail" text={candidate.email} />}
                    {candidate.phone && <ContactLine icon="phone" text={candidate.phone} />}
                    {(candidate.city || candidate.country) && <ContactLine icon="pin" text={[candidate.city, candidate.country].filter(Boolean).join(", ")} />}
                    {candidate.linkedin && <ContactLine icon="link" text={candidate.linkedin} />}
                </div>
                </div>
                <div className="flex gap-3">
                <Stat label="Experience" value={candidate.experienceYears ? `${candidate.experienceYears} yrs` : "—"} />
                <Stat label="Expected" value={fmtMoney(candidate.expectedSalary)} />
                <Stat label="Current" value={fmtMoney(candidate.currentSalary)} />
                </div>
            </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="flex flex-col gap-5 lg:col-span-2">
                {candidate.skills && (
                <Section title="Skills">
                    <div className="flex flex-wrap gap-1.5">
                    {String(candidate.skills).split(",").map((s, i) => {
                        const t = s.trim();
                        if (!t) return null;
                        return <span key={i} className="rounded-md border border-[#E0DDD6] bg-[#FAFAF8] px-2.5 py-1 text-[12px] font-medium text-[#4A4845]">{t}</span>;
                    })}
                    </div>
                </Section>
                )}

                {Array.isArray(candidate.experience) && candidate.experience.some(hasContent) && (
                <Section title="Work Experience">
                    <Timeline>
                    {candidate.experience.filter(hasContent).map((exp, i) => (
                        <TimelineEntry
                        key={i}
                        title={exp.title || "Untitled Role"}
                        subtitle={exp.company}
                        duration={fmtDuration(exp.fromMonth, exp.fromYear, exp.toMonth, exp.toYear, exp.current)}
                        description={exp.summary}
                        />
                    ))}
                    </Timeline>
                </Section>
                )}

                {Array.isArray(candidate.education) && candidate.education.some(hasContent) && (
                <Section title="Education">
                    <Timeline>
                    {candidate.education.filter(hasContent).map((edu, i) => (
                        <TimelineEntry
                        key={i}
                        title={edu.degree || "Degree"}
                        subtitle={[edu.institute, edu.major].filter(Boolean).join(" · ")}
                        duration={fmtDuration(edu.fromMonth, edu.fromYear, edu.toMonth, edu.toYear, edu.pursuing)}
                        />
                    ))}
                    </Timeline>
                </Section>
                )}
            </div>

            <div className="flex flex-col gap-5">
                <Section title="Personal Information">
                <DefList>
                    <Item label="First Name" value={candidate.firstName} />
                    <Item label="Last Name" value={candidate.lastName} />
                    <Item label="Email" value={candidate.email} />
                    <Item label="Phone" value={candidate.phone} />
                </DefList>
                </Section>

                {fullAddress && (
                <Section title="Address">
                    <DefList>
                    <Item label="Street" value={candidate.street} />
                    <Item label="City" value={candidate.city} />
                    <Item label="State" value={candidate.state} />
                    <Item label="Country" value={candidate.country} />
                    <Item label="Pincode" value={candidate.pincode} />
                    </DefList>
                </Section>
                )}

                <Section title="Professional Details">
                <DefList>
                    <Item label="Job Title" value={candidate.jobTitle} />
                    <Item label="Experience" value={candidate.experienceYears ? `${candidate.experienceYears} years` : null} />
                    <Item label="Qualification" value={candidate.qualification} />
                    <Item label="Expected Salary" value={fmtMoney(candidate.expectedSalary)} />
                    <Item label="Current Salary" value={fmtMoney(candidate.currentSalary)} />
                    <Item label="LinkedIn" value={candidate.linkedin} />
                </DefList>
                </Section>

                {candidate.attachments && Object.values(candidate.attachments).some(Boolean) && (
                <Section title="Attachments">
                    <div className="flex flex-col gap-1.5">
                    {Object.entries(candidate.attachments).map(([key, file]) => {
                        if (!file) return null;
                        return <Attachment key={key} label={prettyKey(key)} fileName={file.name || "File"} />;
                    })}
                    </div>
                </Section>
                )}
            </div>
            </div>
        </div>
        </div>
    );
    };

    export default CandidateDetails;

    const hasContent = (obj) => obj && Object.values(obj).some((v) => v !== undefined && v !== null && v !== "" && v !== false);

    const fmtMoney = (n) => {
    if (!n) return null;
    const num = Number(n);
    if (Number.isNaN(num)) return n;
    return `₹ ${num.toLocaleString("en-IN")}`;
    };

    const fmtDuration = (fm, fy, tm, ty, ongoing) => {
    const from = [fm, fy].filter(Boolean).join(" ");
    const to = ongoing ? "Present" : [tm, ty].filter(Boolean).join(" ");
    if (!from && !to) return null;
    return `${from || "—"} → ${to || "—"}`;
    };

    const prettyKey = (k) => k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

    const Section = ({ title, children }) => (
    <div className="overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white">
        <div className="border-b border-[#F0EDE8] bg-[#FAFAF8] px-6 py-3.5">
        <div className="text-[13px] font-semibold text-[#1C1B18]">{title}</div>
        </div>
        <div className="p-6">{children}</div>
    </div>
    );

    const DefList = ({ children }) => <div className="flex flex-col gap-3.5">{children}</div>;

    const Item = ({ label, value }) => (
    <div className="flex items-start gap-4">
        <div className="w-27.5 shrink-0 text-[12px] font-medium text-[#9B9890]">{label}</div>
        <div className={`flex-1 wrap-break-word text-[13px] ${value ? "text-[#1C1B18]" : "text-[#C8C5BD]"}`}>{value || "—"}</div>
    </div>
    );

    const Stat = ({ label, value }) => (
    <div className="flex min-w-27.5 flex-col rounded-xl border border-[#E8E6E0] bg-[#FAFAF8] px-4 py-3">
        <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-[#9B9890]">{label}</span>
        <span className="mt-0.5 text-[14px] font-semibold text-[#1C1B18]">{value || "—"}</span>
    </div>
    );

    const StatusBadge = ({ status }) => {
    const s = status || "New";
    const map = {
        New:         "bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]",
        Screening:   "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
        Shortlisted: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
        Interview:   "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]",
        Offer:       "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]",
        Hired:       "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
        Rejected:    "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]",
        "On Hold":   "bg-[#F5F4F0] text-[#6B6860] border-[#E0DDD6]",
        Withdrawn:   "bg-[#FAFAF8] text-[#9B9890] border-[#E0DDD6]",
        Active:      "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
    };
    const cls = map[s] || map.New;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {s}
        </span>
    );
    };

    const ContactLine = ({ icon, text }) => {
    const icons = {
        mail:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
        phone: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
        pin:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
        link:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
    };
    return (
        <span className="inline-flex items-center gap-1.5">
        <span className="text-[#9B9890]">{icons[icon]}</span>
        <span className="truncate">{text}</span>
        </span>
    );
    };

    const Timeline = ({ children }) => <div className="flex flex-col">{children}</div>;

    const TimelineEntry = ({ title, subtitle, duration, description }) => (
    <div className="flex gap-4 pb-5 last:pb-0">
        <div className="relative flex w-7 shrink-0 flex-col items-center">
        <div className="z-2 mt-1 h-2.5 w-2.5 rounded-full border-2 border-[#1C4ED8] bg-white" />
        <div className="mt-1 w-px flex-1 bg-[#E8E6E0]" />
        </div>
        <div className="flex-1 pb-1">
        <div className="text-[14px] font-semibold text-[#1C1B18]">{title}</div>
        {subtitle && <div className="mt-0.5 text-[13px] text-[#4A4845]">{subtitle}</div>}
        {duration && <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.05em] text-[#9B9890]">{duration}</div>}
        {description && <p className="mt-2 text-[13px] leading-[1.6] text-[#4A4845]">{description}</p>}
        </div>
    </div>
    );

    const Attachment = ({ label, fileName }) => (
    <div className="flex items-center gap-3 rounded-[10px] border border-[#E8E6E0] bg-[#FAFAF8] px-3 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#1C4ED8]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
        </div>
        <div className="min-w-0 flex-1">
        <div className="text-[12px] font-medium text-[#1C1B18]">{label}</div>
        <div className="truncate text-[11px] text-[#9B9890]">{fileName}</div>
        </div>
    </div>
    );