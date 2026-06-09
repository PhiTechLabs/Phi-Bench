import React, { useState, useEffect } from "react";
import { addFeedback } from "../../api/interviewsApi";

const Ico = ({ d, size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);
const D = {
    x:    "M18 6L6 18M6 6l12 12",
    check:"M20 6L9 17l-5-5",
    send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    info: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
};

const OUTCOMES = [
    {
        value: "Cleared",
        label: "Cleared",
        sub: "Advanced to next round",
        accent: "#059669", bg: "#ECFDF5", border: "#6EE7B7", text: "#065F46",
        hoverBg: "#D1FAE5",
    },
    {
        value: "Selected",
        label: "Selected",
        sub: "Candidate is finally selected",
        accent: "#0284C7", bg: "#F0F9FF", border: "#7DD3FC", text: "#0C4A6E",
        hoverBg: "#E0F2FE",
    },
    {
        value: "Rejected",
        label: "Rejected",
        sub: "Not moving forward",
        accent: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5", text: "#7F1D1D",
        hoverBg: "#FEE2E2",
    },
    {
        value: "Done",
        label: "Done",
        sub: "Interview done, decision pending",
        accent: "#7C3AED", bg: "#F5F3FF", border: "#C4B5FD", text: "#4C1D95",
        hoverBg: "#EDE9FE",
    },
    {
        value: "Backout",
        label: "Backout",
        sub: "Candidate withdrew",
        accent: "#EA580C", bg: "#FFF7ED", border: "#FDBA74", text: "#7C2D12",
        hoverBg: "#FFEDD5",
    },
    {
        value: "No Show",
        label: "No Show",
        sub: "Candidate didn't appear",
        accent: "#475569", bg: "#F8FAFC", border: "#CBD5E1", text: "#1E293B",
        hoverBg: "#F1F5F9",
    },
    {
        value: "Client Reschedule",
        label: "Client Reschedule",
        sub: "Client requested a new slot",
        accent: "#B45309", bg: "#FFFBEB", border: "#FCD34D", text: "#78350F",
        hoverBg: "#FEF3C7",
    },
    {
        value: "Candidate Reschedule",
        label: "Candidate Reschedule",
        sub: "Candidate needs a new slot",
        accent: "#B45309", bg: "#FFFBEB", border: "#FCD34D", text: "#78350F",
        hoverBg: "#FEF3C7",
    },
];

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function InterviewFeedbackModal({ interview, onClose, onSuccess }) {
    const [outcome,  setOutcome]  = useState("");
    const [feedback, setFeedback] = useState("");
    const [rating,   setRating]   = useState(0);
    const [notes,    setNotes]    = useState("");
    const [saving,   setSaving]   = useState(false);
    const [error,    setError]    = useState("");
    const [done,     setDone]     = useState(false);

    useEffect(() => {
        const fn = (e) => { if (e.key === "Escape" && !saving) onClose(); };
        document.addEventListener("keydown", fn);
        return () => document.removeEventListener("keydown", fn);
    }, [saving]);

    const o          = OUTCOMES.find((x) => x.value === outcome);
    const showDetail = ["Cleared", "Selected", "Rejected", "Done"].includes(outcome);

    const submit = async () => {
        if (!outcome) { setError("Please select an outcome to continue."); return; }
        setSaving(true); setError("");
        try {
            const updated = await addFeedback(interview.id, {
                outcome,
                feedback: feedback.trim(),
                rating:   rating || null,
                notes:    notes.trim(),
            });
            setDone(true);
            setTimeout(() => { onSuccess?.(updated); onClose(); }, 900);
        } catch (e) {
            setError(e?.response?.data?.message || "Could not submit feedback.");
            setSaving(false);
        }
    };

    const name   = interview.candidateName || "Candidate";
    const inits  = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
    const dtStr  = interview.scheduledDate
        ? new Date(interview.scheduledDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(2,6,23,0.55)", backdropFilter: "blur(6px)" }}>
            <div className="absolute inset-0" onClick={() => !saving && onClose()} />

            <div className="relative w-full max-w-[460px] rounded-2xl bg-white overflow-hidden"
                style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)", animation: "fadeUp .16s cubic-bezier(.22,1,.36,1)" }}>

                {/* thin accent strip — changes with outcome */}
                <div className="h-[3px] w-full transition-all duration-300"
                    style={{ background: o ? o.accent : "#1e3a5f" }} />

                {/* ── HEADER ─────────────────────────────────────────────── */}
                <div className="px-6 pt-5 pb-4"
                    style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1a3352 60%, #162b45 100%)" }}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-[#1e3a5f] bg-white/90 font-extrabold text-[13px] shrink-0 tracking-tight">
                                {inits}
                            </div>
                            <div>
                                <p className="text-white font-bold text-[15px] leading-tight">
                                    Interview Feedback
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-[11.5px] font-medium" style={{ color: "rgba(147,197,253,0.9)" }}>
                                        {name}
                                    </span>
                                    <span className="rounded-md px-2 py-0.5 text-[10.5px] font-bold text-white"
                                        style={{ background: "rgba(255,255,255,0.12)" }}>
                                        {interview.interviewRound || "Interview"}
                                    </span>
                                    {interview.interviewType && (
                                        <span className="text-[11px]" style={{ color: "rgba(147,197,253,0.65)" }}>
                                            {interview.interviewType}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => !saving && onClose()}
                            className="rounded-xl p-1.5 transition-all shrink-0"
                            style={{ color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.07)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "white"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}>
                            <Ico d={D.x} size={16} />
                        </button>
                    </div>

                    {/* meta row */}
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px]" style={{ color: "rgba(147,197,253,0.65)" }}>
                        {interview.jobTitle && <span><span style={{ color: "rgba(147,197,253,0.9)" }} className="font-semibold">Job:</span> {interview.jobTitle}</span>}
                        <span><span style={{ color: "rgba(147,197,253,0.9)" }} className="font-semibold">Date:</span> {dtStr}</span>
                    </div>
                </div>

                {/* ── BODY ───────────────────────────────────────────────── */}
                <div className="px-5 py-4 space-y-4 max-h-[62vh] overflow-y-auto"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 transparent" }}>

                    {/* outcome list */}
                    <div>
                        <p className="mb-2.5 text-[10.5px] font-bold uppercase tracking-widest text-slate-400">
                            Outcome <span className="normal-case font-normal tracking-normal text-red-400">*</span>
                        </p>
                        <div className="space-y-1.5">
                            {OUTCOMES.map((oc) => {
                                const sel = outcome === oc.value;
                                return (
                                    <button key={oc.value}
                                        onClick={() => { setOutcome(oc.value); setError(""); }}
                                        className="w-full flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all duration-150 outline-none group"
                                        style={{
                                            background:  sel ? oc.bg     : "#F9FAFB",
                                            borderColor: sel ? oc.border : "#E5E9EE",
                                            boxShadow:   sel ? `0 0 0 2px ${oc.accent}33` : "none",
                                        }}
                                        onMouseEnter={e => {
                                            if (!sel) {
                                                e.currentTarget.style.background  = oc.hoverBg;
                                                e.currentTarget.style.borderColor = oc.border;
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!sel) {
                                                e.currentTarget.style.background  = "#F9FAFB";
                                                e.currentTarget.style.borderColor = "#E5E9EE";
                                            }
                                        }}>

                                        {/* left dot indicator */}
                                        <span className="h-2.5 w-2.5 rounded-full shrink-0 border-2 transition-all duration-150"
                                            style={{
                                                borderColor: sel ? oc.accent : "#CBD5E1",
                                                background:  sel ? oc.accent : "transparent",
                                            }} />

                                        {/* label + sub */}
                                        <div className="flex-1 min-w-0">
                                            <span className="block text-[12.5px] font-semibold leading-tight transition-colors duration-150"
                                                style={{ color: sel ? oc.text : "#374151" }}>
                                                {oc.label}
                                            </span>
                                            <span className="block text-[10.5px] leading-tight mt-0.5 transition-colors duration-150"
                                                style={{ color: sel ? oc.accent + "bb" : "#9CA3AF" }}>
                                                {oc.sub}
                                            </span>
                                        </div>

                                        {/* check on selected */}
                                        {sel && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full shrink-0"
                                                style={{ background: oc.accent }}>
                                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                                                    stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 6L9 17l-5-5" />
                                                </svg>
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* detail block — rating + feedback */}
                    {showDetail && (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 space-y-3.5">
                            <p className="text-[10.5px] font-bold uppercase tracking-widest text-slate-400 -mb-0.5">Evaluation</p>

                            {/* stars */}
                            <div>
                                <p className="text-[12px] font-semibold text-slate-600 mb-2">Rating</p>
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <button key={n} type="button"
                                            onClick={() => setRating(n === rating ? 0 : n)}
                                            className="transition-transform duration-100 hover:scale-110 active:scale-95 outline-none">
                                            <svg width={22} height={22} viewBox="0 0 24 24"
                                                fill={n <= rating ? "#F59E0B" : "none"}
                                                stroke={n <= rating ? "#F59E0B" : "#D1D5DB"}
                                                strokeWidth="1.5">
                                                <path d={D.star} />
                                            </svg>
                                        </button>
                                    ))}
                                    {rating > 0 && (
                                        <span className="ml-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                                            {RATING_LABELS[rating]}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* feedback */}
                            <div>
                                <p className="text-[12px] font-semibold text-slate-600 mb-1.5">
                                    Feedback <span className="font-normal text-slate-400">(optional)</span>
                                </p>
                                <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={2}
                                    placeholder="Technical skills, communication, cultural fit, areas of concern…"
                                    className="w-full rounded-xl border bg-white px-3.5 py-2.5 text-[12.5px] text-slate-700 placeholder-slate-300 resize-none outline-none transition-all"
                                    style={{ borderColor: "#E2E8F0" }}
                                    onFocus={e  => { e.target.style.borderColor = "#93C5FD"; e.target.style.boxShadow = "0 0 0 3px rgba(147,197,253,0.2)"; }}
                                    onBlur={e   => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }} />
                            </div>
                        </div>
                    )}

                    {/* internal notes */}
                    {outcome && (
                        <div>
                            <p className="text-[12px] font-semibold text-slate-600 mb-1.5">
                                Internal Notes <span className="font-normal text-slate-400">(not shared with client)</span>
                            </p>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                                placeholder="Next steps, follow-up actions, reminders…"
                                className="w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-[12.5px] text-slate-700 placeholder-slate-300 resize-none outline-none transition-all"
                                style={{ borderColor: "#E2E8F0" }}
                                onFocus={e  => { e.target.style.borderColor = "#93C5FD"; e.target.style.boxShadow = "0 0 0 3px rgba(147,197,253,0.2)"; }}
                                onBlur={e   => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }} />
                        </div>
                    )}

                    {/* auto-advance notice */}
                    {outcome && !done && (
                        <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                            <span className="text-blue-400 shrink-0 mt-0.5"><Ico d={D.info} size={14} /></span>
                            <p className="text-[11.5px] text-blue-700 leading-relaxed">
                                Submission status will <strong>auto-update</strong> based on your selected outcome.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-[12px] text-red-600 font-medium">
                            <span>⚠</span> {error}
                        </div>
                    )}
                    {done && (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-[12px] text-emerald-600 font-semibold">
                            <Ico d={D.check} size={13} /> Feedback submitted — status updated!
                        </div>
                    )}

                    {/* actions */}
                    <div className="flex gap-2.5 pt-1">
                        <button onClick={() => !saving && onClose()}
                            className="flex-1 rounded-xl border py-2.5 text-[13px] font-semibold transition-all"
                            style={{ borderColor: "#E2E8F0", color: "#64748B", background: "white" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.borderColor = "#CBD5E1"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.borderColor = "#E2E8F0"; }}>
                            Cancel
                        </button>
                        <button onClick={submit} disabled={saving || !outcome || done}
                            className="flex-[2] flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: o
                                    ? `linear-gradient(135deg, ${o.accent}, ${o.accent}cc)`
                                    : "linear-gradient(135deg, #1e3a5f, #2563EB)",
                            }}>
                            {saving
                                ? <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Submitting…</>
                                : done
                                    ? <><Ico d={D.check} size={14} /> Done</>
                                    : <><Ico d={D.send}  size={13} /> Submit Feedback</>
                            }
                        </button>
                    </div>
                </div>
            </div>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}`}</style>
        </div>
    );
}