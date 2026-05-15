import React, { useState, useEffect } from "react";
import { listCandidates } from "../api/candidatesApi";
import { listJobs } from "../api/jobsApi";

/* ──────────────────── OPTIONS ──────────────────── */
const ROUNDS  = ["Screening", "Technical", "Managerial", "HR", "Final"];
const MODES   = ["Video", "Phone", "Onsite", "Take-home"];
const STATUSES = ["Scheduled", "Completed", "Rescheduled", "Cancelled", "No Show"];

/* ──────────────────── COMPONENT ──────────────────── */

const InterviewForm = ({ setShowForm, onSave, initial = {} }) => {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs]             = useState([]);

  const [form, setForm] = useState({
    candidateId:   initial.candidateId   || "",
    candidateName: initial.candidateName || "",
    jobId:         initial.jobId         || "",
    jobTitle:      initial.jobTitle      || "",
    client:        initial.client        || "",
    round:         initial.round         || "Screening",
    mode:          initial.mode          || "Video",
    dateTime:      initial.dateTime      || "",
    duration:      initial.duration      || "45 min",
    interviewer:   initial.interviewer   || "",
    meetingLink:   initial.meetingLink   || "",
    recruiter:     initial.recruiter     || "",
    status:        initial.status        || "Scheduled",
    feedbackRating:initial.feedbackRating|| "",
    notes:         initial.notes         || "",
  });

  useEffect(() => {
    (async () => {
      setCandidates(await listCandidates());
      setJobs(await listJobs());
    })();
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /* When user picks a candidate, auto-fill name */
  const onCandidateSelect = (id) => {
    const c = candidates.find((c) => c.id === id);
    setForm((f) => ({
      ...f,
      candidateId: id,
      candidateName: c ? `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.name || "" : "",
    }));
  };

  /* When user picks a job, auto-fill title + client */
  const onJobSelect = (id) => {
    const j = jobs.find((j) => j.id === id);
    setForm((f) => ({
      ...f,
      jobId: id,
      jobTitle: j?.title || "",
      client:   j?.client || f.client,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.candidateName || !form.dateTime) {
      alert("Candidate and date/time are required");
      return;
    }
    onSave(form);
  };

  /* ── shared styles ── */
  const labelCls = "mb-1 block text-[11.5px] font-medium text-[#4A4845]";
  const inputCls =
    "w-full rounded-lg border border-[#E0DDD6] bg-white px-3 py-2 text-[12.5px] text-[#1C1B18] outline-none transition focus:border-[#1C4ED8] focus:ring-2 focus:ring-[#1C4ED8]/15";

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      <div className="mx-auto w-full max-w-240 px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-[20px] font-semibold text-[#1C1B18]">Schedule Interview</h1>
          <button
            onClick={() => setShowForm(false)}
            className="rounded-lg border border-[#E0DDD6] bg-white px-3 py-1.5 text-[12px] font-medium text-[#4A4845] hover:bg-[#FAFAF8]"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── SECTION: Interview Info ── */}
          <section className="rounded-2xl border border-[#E8E6E0] bg-white p-5">
            <div className="mb-4">
              <h2 className="text-[14px] font-semibold text-[#1C1B18]">Interview Info</h2>
              <p className="text-[11.5px] text-[#9B9890]">Who, what, and which round</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Candidate *</label>
                <select
                  className={inputCls}
                  value={form.candidateId}
                  onChange={(e) => onCandidateSelect(e.target.value)}
                >
                  <option value="">Select candidate…</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {`${c.firstName || ""} ${c.lastName || ""}`.trim() || c.name || c.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Job / Position</label>
                <select
                  className={inputCls}
                  value={form.jobId}
                  onChange={(e) => onJobSelect(e.target.value)}
                >
                  <option value="">Select job…</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} {j.client ? `— ${j.client}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Client</label>
                <input
                  className={inputCls}
                  placeholder="Client company"
                  value={form.client}
                  onChange={(e) => update("client", e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Round</label>
                <select className={inputCls} value={form.round} onChange={(e) => update("round", e.target.value)}>
                  {ROUNDS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Mode</label>
                <select className={inputCls} value={form.mode} onChange={(e) => update("mode", e.target.value)}>
                  {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={form.status} onChange={(e) => update("status", e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* ── SECTION: Scheduling ── */}
          <section className="rounded-2xl border border-[#E8E6E0] bg-white p-5">
            <div className="mb-4">
              <h2 className="text-[14px] font-semibold text-[#1C1B18]">Scheduling</h2>
              <p className="text-[11.5px] text-[#9B9890]">When and for how long</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Date & Time *</label>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={form.dateTime}
                  onChange={(e) => update("dateTime", e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Duration</label>
                <input
                  className={inputCls}
                  placeholder="e.g. 45 min, 1 hr"
                  value={form.duration}
                  onChange={(e) => update("duration", e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Interviewer</label>
                <input
                  className={inputCls}
                  placeholder="Interviewer name"
                  value={form.interviewer}
                  onChange={(e) => update("interviewer", e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Recruiter</label>
                <input
                  className={inputCls}
                  placeholder="Recruiter name"
                  value={form.recruiter}
                  onChange={(e) => update("recruiter", e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Meeting Link</label>
                <input
                  className={inputCls}
                  placeholder="Zoom / Meet / Teams link"
                  value={form.meetingLink}
                  onChange={(e) => update("meetingLink", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* ── SECTION: Outcome & Notes ── */}
          <section className="rounded-2xl border border-[#E8E6E0] bg-white p-5">
            <div className="mb-4">
              <h2 className="text-[14px] font-semibold text-[#1C1B18]">Outcome & Notes</h2>
              <p className="text-[11.5px] text-[#9B9890]">Fill in after the interview</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Feedback Rating (1–5)</label>
                <input
                  type="number" min="1" max="5"
                  className={inputCls}
                  placeholder="e.g. 4"
                  value={form.feedbackRating}
                  onChange={(e) => update("feedbackRating", e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Notes</label>
                <textarea
                  className={`${inputCls} min-h-25 resize-y`}
                  placeholder="Feedback, next steps, concerns…"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* ── ACTIONS ── */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-[#E0DDD6] bg-white px-4 py-2 text-[12.5px] font-medium text-[#4A4845] hover:bg-[#F5F4F0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#1C4ED8] px-4 py-2 text-[12.5px] font-medium text-white shadow-[0_1px_3px_rgba(28,78,216,0.3)] hover:bg-[#1741B6]"
            >
              Save Interview →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewForm;