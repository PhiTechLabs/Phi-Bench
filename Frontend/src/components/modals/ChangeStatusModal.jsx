import React, { useState, useEffect } from "react";
import { updateSubmission } from "../../api/submissionsApi";
import { getAllowedTransitions, getStatusStyle } from "../../utils/submissionStatuses";

const Ico = ({ d, size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);
const D = {
    x:     "M18 6L6 18M6 6l12 12",
    check: "M20 6L9 17l-5-5",
    arrow: "M5 12h14M12 5l7 7-7 7",
    lock:  "M12 17v-2m-6 6h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    cal:   "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
};

const INTERVIEW_LOCKED_STATUSES = [
    "L1 Scheduled",
    "L2 Scheduled",
    "L3 Scheduled",
    "L4 Scheduled",
];

const Pill = ({ status }) => {
    const s = getStatusStyle(status);
    return (
        <span style={{ background: s.bg, color: s.text, border: `1px solid ${s.border || s.dot + "66"}` }}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-semibold whitespace-nowrap">
            <span style={{ background: s.dot }} className="h-1.5 w-1.5 rounded-full shrink-0" />
            {status}
        </span>
    );
};

export default function ChangeStatusModal({ submission, onClose, onSuccess }) {
    const allowed = getAllowedTransitions(submission.status);
    const isInterviewLocked = INTERVIEW_LOCKED_STATUSES.includes(submission.status);
    const [selected, setSelected] = useState("");
    const [note,     setNote]     = useState("");
    const [saving,   setSaving]   = useState(false);
    const [error,    setError]    = useState("");
    const [done,     setDone]     = useState(false);

    useEffect(() => {
        const fn = (e) => { if (e.key === "Escape" && !saving) onClose(); };
        document.addEventListener("keydown", fn);
        return () => document.removeEventListener("keydown", fn);
    }, [saving]);

    const save = async () => {
        if (!selected) { setError("Please select a status to continue."); return; }
        setSaving(true); setError("");
        try {
            const updated = await updateSubmission(submission.id, { status: selected, statusNote: note.trim() });
            setDone(true);
            setTimeout(() => { onSuccess?.(updated); onClose(); }, 900);
        } catch (e) {
            setError(e?.response?.data?.message || "Could not update status.");
            setSaving(false);
        }
    };

    const selStyle = selected ? getStatusStyle(selected) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(2,6,23,0.55)", backdropFilter: "blur(6px)" }}>
            <div className="absolute inset-0" onClick={() => !saving && onClose()} />

            <div className="relative w-full max-w-[410px] rounded-2xl bg-white overflow-hidden"
                style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)", animation: "fadeUp .16s cubic-bezier(.22,1,.36,1)" }}>

                {/* ── HEADER ─────────────────────────────────────────────── */}
                <div className="px-6 pt-6 pb-5"
                    style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1a3352 60%, #162b45 100%)" }}>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-white font-bold text-[15.5px] tracking-tight leading-tight">
                                Move Status
                            </p>
                            <p className="mt-0.5 text-[11.5px] font-medium truncate max-w-[280px]"
                                style={{ color: "rgba(148,197,255,0.85)" }}>
                                {submission.candidateName || submission.jobTitle || "Submission"}
                            </p>
                        </div>
                        <button onClick={() => !saving && onClose()}
                            className="rounded-xl p-1.5 transition-all shrink-0"
                            style={{ color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.07)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.color = "white"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                            <Ico d={D.x} size={16} />
                        </button>
                    </div>

                    {/* from → to preview */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <Pill status={submission.status} />
                        {selected ? (
                            <>
                                <span style={{ color: "rgba(148,197,255,0.7)" }}>
                                    <Ico d={D.arrow} size={14} />
                                </span>
                                <Pill status={selected} />
                            </>
                        ) : (
                            <span className="text-[11px] italic" style={{ color: "rgba(148,197,255,0.55)" }}>
                                — pick a status below
                            </span>
                        )}
                    </div>
                </div>

                {/* ── BODY ───────────────────────────────────────────────── */}
                <div className="px-5 py-4 space-y-4">

                    {allowed.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                            {isInterviewLocked ? (
                                <>
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-amber-500"
                                        style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A" }}>
                                        <Ico d={D.cal} size={26} />
                                    </div>
                                    <div>
                                        <p className="text-[13.5px] font-bold text-slate-700">Interview Pending</p>
                                        <p className="text-[12px] text-slate-500 mt-1 max-w-[230px] leading-relaxed">
                                            No further status change allowed until the interview is conducted and feedback is submitted.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11.5px] font-medium text-amber-700 max-w-[260px]"
                                        style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                                        <Ico d={D.lock} size={13} />
                                        Schedule the interview first, then submit feedback to unlock.
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                        <Ico d={D.lock} size={22} />
                                    </div>
                                    <div>
                                        <p className="text-[13.5px] font-bold text-slate-700">Terminal Status</p>
                                        <p className="text-[12px] text-slate-400 mt-0.5">No further transitions available.</p>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-1.5 max-h-[240px] overflow-y-auto pr-0.5"
                            style={{ scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 transparent" }}>
                            {allowed.map((s) => {
                                const st  = getStatusStyle(s);
                                const sel = selected === s;
                                return (
                                    <button key={s} onClick={() => { setSelected(s); setError(""); }}
                                        className="group relative text-left rounded-xl px-3 py-2.5 border transition-all duration-150 outline-none"
                                        style={{
                                            background:  sel ? st.bg       : "#F9FAFB",
                                            borderColor: sel ? st.dot      : "#E5E9EE",
                                            boxShadow:   sel ? `0 0 0 2px ${st.dot}44` : "none",
                                        }}
                                        onMouseEnter={e => {
                                            if (!sel) {
                                                e.currentTarget.style.background   = st.bg;
                                                e.currentTarget.style.borderColor  = st.dot + "99";
                                                e.currentTarget.style.boxShadow    = `0 2px 8px ${st.dot}22`;
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!sel) {
                                                e.currentTarget.style.background  = "#F9FAFB";
                                                e.currentTarget.style.borderColor = "#E5E9EE";
                                                e.currentTarget.style.boxShadow   = "none";
                                            }
                                        }}>
                                        <div className="flex items-center gap-2 leading-snug">
                                            <span className="h-[18px] w-[3px] rounded-full shrink-0 transition-all duration-150"
                                                style={{ background: sel ? st.dot : "#D1D5DB" }} />
                                            <span className="text-[11.5px] font-semibold leading-tight transition-colors duration-150"
                                                style={{ color: sel ? st.text : "#4B5563" }}>
                                                {s}
                                            </span>
                                        </div>
                                        {sel && (
                                            <span className="absolute top-2 right-2 flex h-[18px] w-[18px] items-center justify-center rounded-full"
                                                style={{ background: st.dot }}>
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
                    )}

                    {/* note textarea */}
                    {allowed.length > 0 && (
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                            placeholder="Add a note — reason, client feedback, next step…"
                            className="w-full rounded-xl border px-3.5 py-2.5 text-[12.5px] text-slate-700 placeholder-slate-300 resize-none outline-none transition-all"
                            style={{ borderColor: "#E2E8F0", background: "#F8FAFC" }}
                            onFocus={e => { e.target.style.borderColor = "#93C5FD"; e.target.style.boxShadow = "0 0 0 3px rgba(147,197,253,0.2)"; }}
                            onBlur={e  => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }} />
                    )}

                    {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-[12px] text-red-600 font-medium">
                            <span className="text-red-400">⚠</span> {error}
                        </div>
                    )}
                    {done && (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-[12px] text-emerald-600 font-semibold">
                            <Ico d={D.check} size={13} /> Status updated successfully!
                        </div>
                    )}

                    {/* actions */}
                    <div className="flex gap-2.5">
                        <button onClick={() => !saving && onClose()}
                            className="flex-1 rounded-xl border py-2.5 text-[13px] font-semibold transition-all"
                            style={{ borderColor: "#E2E8F0", color: "#64748B", background: "white" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.borderColor = "#CBD5E1"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.borderColor = "#E2E8F0"; }}>
                            Cancel
                        </button>
                        {allowed.length > 0 && (
                            <button onClick={save} disabled={saving || !selected || done}
                                className="flex-[2] flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    background: selStyle
                                        ? `linear-gradient(135deg, ${selStyle.dot}, ${selStyle.dot}cc)`
                                        : "linear-gradient(135deg, #1e3a5f, #2563EB)",
                                }}>
                                {saving
                                    ? <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</>
                                    : done
                                        ? <><Ico d={D.check} size={14} /> Done</>
                                        : <><Ico d={D.arrow} size={14} /> {selected ? `Move to ${selected}` : "Select a status"}</>
                                }
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}`}</style>
        </div>
    );
}