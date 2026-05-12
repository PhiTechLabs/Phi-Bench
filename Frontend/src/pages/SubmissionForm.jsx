import React, { useState, useEffect } from "react";
import { listCandidates } from "../api/candidatesApi";
import { listJobs } from "../api/jobsApi";

/* ──────────────────── OPTIONS ──────────────────── */
const STATUSES = [
  "Submitted",
  "Client Review",
  "Shortlisted",
  "Interview Scheduled",
  "Offer",
  "Placed",
  "Rejected",
  "Withdrawn",
];

/* ──────────────────── COMPONENT ──────────────────── */

const SubmissionForm = ({ setShowForm, onSave, initial = {} }) => {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs]             = useState([]);

  const [form, setForm] = useState({
    candidateId:    initial.candidateId    || "",
    candidateName:  initial.candidateName  || "",
    jobId:          initial.jobId          || "",
    jobTitle:       initial.jobTitle       || "",
    client:         initial.client         || "",
    submittedBy:    initial.submittedBy    || "",
    submissionDate: initial.submissionDate || new Date().toISOString().slice(0, 10),
    expectedRate:   initial.expectedRate   || "",
    vendor:         initial.vendor         || "",
    status:         initial.status         || "Submitted",
    clientFeedback: initial.clientFeedback || "",
    notes:          initial.notes          || "",
  });

  useEffect(() => {
    (async () => {
      setCandidates(await listCandidates());
      setJobs(await listJobs());
    })();
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onCandidateSelect = (id) => {
    const c = candidates.find((c) => c.id === id);
    setForm((f) => ({
      ...f,
      candidateId: id,
      candidateName: c
        ? `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.name || ""
        : "",
    }));
  };

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
    if (!form.candidateName || !form.jobTitle) {
      alert("Candidate and position are required");
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
      <div className="mx-auto w-full max-w-[960px] px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-[20px] font-semibold text-[#1C1B18]">New Submission</h1>
          <button
            onClick={() => setShowForm(false)}
            className="rounded-lg border border-[#E0DDD6] bg-white px-3 py-1.5 text-[12px] font-medium text-[#4A4845] hover:bg-[#FAFAF8]"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── SECTION: Submission Info ── */}
          <section className="rounded-2xl border border-[#E8E6E0] bg-white p-5">
            <div className="mb-4">
              <h2 className="text-[14px] font-semibold text-[#1C1B18]">Submission Info</h2>
              <p className="text-[11.5px] text-[#9B9890]">Who is being submitted, and where</p>
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
                <label className={labelCls}>Job / Position *</label>
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
                <label className={labelCls}>Vendor (optional)</label>
                <input
                  className={inputCls}
                  placeholder="Vendor / partner name"
                  value={form.vendor}
                  onChange={(e) => update("vendor", e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Submitted By</label>
                <input
                  className={inputCls}
                  placeholder="Recruiter name"
                  value={form.submittedBy}
                  onChange={(e) => update("submittedBy", e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Submission Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.submissionDate}
                  onChange={(e) => update("submissionDate", e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Expected Rate / Salary</label>
                <input
                  className={inputCls}
                  placeholder="e.g. $65/hr or $120k"
                  value={form.expectedRate}
                  onChange={(e) => update("expectedRate", e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <select
                  className={inputCls}
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* ── SECTION: Feedback & Notes ── */}
          <section className="rounded-2xl border border-[#E8E6E0] bg-white p-5">
            <div className="mb-4">
              <h2 className="text-[14px] font-semibold text-[#1C1B18]">Feedback & Notes</h2>
              <p className="text-[11.5px] text-[#9B9890]">Updates from the client</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelCls}>Client Feedback</label>
                <textarea
                  className={`${inputCls} min-h-[80px] resize-y`}
                  placeholder="What did the client say?"
                  value={form.clientFeedback}
                  onChange={(e) => update("clientFeedback", e.target.value)}
                />
              </div>

              <div>
                <label className={labelCls}>Internal Notes</label>
                <textarea
                  className={`${inputCls} min-h-[80px] resize-y`}
                  placeholder="Anything else worth tracking…"
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
              Save Submission →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmissionForm;