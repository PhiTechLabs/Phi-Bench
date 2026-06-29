import React, { useState, useEffect, useRef } from "react";
import { getAllClients } from "../api/clientApi";
import { getNextCodePreview } from "../api/codePreviewApi";

const JobForm = ({ setShowForm, onSave }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // ─── CLIENT LIST (for the searchable client picker) ──────────────────────
  const [clients, setClients]           = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState(false);

  // ─── NEXT CODE PREVIEW ─────────────────────────────────────────────────────
  // Read-only preview of the code this job will be assigned (e.g. "JC014").
  // The real code is only actually assigned by the backend at save time —
  // this is purely informational so the user isn't surprised by it later.
  const [nextCode, setNextCode] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const code = await getNextCodePreview("job");
        setNextCode(code);
      } catch (err) {
        console.warn("Failed to preview next job code:", err?.response?.data || err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllClients();
        const list = Array.isArray(data) ? data : (data?.clients || []);
        setClients(
          list.map((c) => ({ id: c._id || c.id, clientName: c.clientName }))
        );
      } catch (err) {
        console.warn("Failed to load clients:", err?.response?.data || err);
        setClientsError(true);
      } finally {
        setClientsLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field as user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  // Called when the user picks a client from the dropdown — stores both the
  // real Client _id (clientId, sent to the backend as the source of truth)
  // and the display name (client, shown in the input + used in tables).
  const handleClientSelect = (client) => {
    setFormData((f) => ({ ...f, clientId: client.id, client: client.clientName }));
    if (errors.clientId) {
      setErrors((e) => ({ ...e, clientId: undefined }));
    }
  };

  const validate = () => {
    const next = {};
    if (!formData.title?.trim())       next.title = "Position title is required";
    if (!formData.clientId)            next.clientId = "Please select an existing client";
    if (!formData.description?.trim()) next.description = "Job description is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      // Scroll to top so user sees error highlights
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    onSave(formData);
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      {/* HEADER */}
      <div className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#E8E6E0] bg-white/90 px-8 backdrop-blur-md">
        <div className="flex items-center gap-5">
          <button
            onClick={() => setShowForm(false)}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E0DDD6] bg-white text-lg text-[#6B6860] transition-all hover:bg-[#F5F4F0]"
          >
            ←
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9B9890]">
                PhiBench
              </div>
              {nextCode && (
                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                  Next code: {nextCode}
                </span>
              )}
            </div>
            <div className="text-[18px] font-semibold leading-tight text-[#1C1B18]">
              New Job Opening
            </div>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => setShowForm(false)}
            className="rounded-[10px] border border-[#E0DDD6] bg-white px-5 py-2.5 text-[13px] font-medium text-[#4A4845] transition-all hover:bg-[#F5F4F0]"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-[10px] bg-[#1C4ED8] px-5.5 py-2.5 text-[13px] font-medium text-white shadow-[0_1px_3px_rgba(28,78,216,0.3)] transition-all hover:bg-[#1741B6] hover:shadow-[0_4px_12px_rgba(28,78,216,0.35)]"
          >
            Save Job Opening →
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="mx-auto max-w-5xl px-6 py-6 pb-10">
        {/* Inline error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-2.5 text-[12.5px] text-[#B91C1C]">
            <div className="font-semibold">Please fix the following before saving:</div>
            <ul className="mt-1 list-disc pl-5">
              {Object.values(errors).filter(Boolean).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* SECTION 1: JOB INFO */}
          <Section title="Job Info" subtitle="Core details about the position and assignment">
            <Row>
              <Field label="Position Title" name="title" placeholder="e.g. Senior Java Developer" onChange={handleChange} required error={errors.title} />
              <ClientSelect
                label="Client"
                clients={clients}
                loading={clientsLoading}
                loadError={clientsError}
                value={formData.clientId}
                displayValue={formData.client}
                onSelect={handleClientSelect}
                required
                error={errors.clientId}
              />
            </Row>
            <Row>
              <Field label="Contact Name" name="contact" placeholder="Hiring manager" onChange={handleChange} />
              <Field label="Account Manager" name="manager" placeholder="Internal AM" onChange={handleChange} />
            </Row>
            <Row>
              <Field label="Assign Recruiter" name="recruiter" placeholder="Recruiter name" onChange={handleChange} />
              <SelectField
                label="Job Status"
                name="status"
                options={["Open", "Closed", "On Hold", "Filled"]}
                onChange={handleChange}
              />
            </Row>
            <Row>
              <Field label="Date Opened" name="dateOpened" type="date" onChange={handleChange} />
              <Field label="Target Date" name="targetDate" type="date" onChange={handleChange} />
            </Row>
            <Row>
              <Field label="Job Type" name="jobType" placeholder="Full-time / Contract / C2C" onChange={handleChange} />
              <Field label="Work Experience" name="experience" placeholder="e.g. 5+ years" onChange={handleChange} />
            </Row>
            <Row>
              <Field label="Industry" name="industry" placeholder="e.g. Fintech, Healthcare" onChange={handleChange} />
              <Field label="Salary / Rate" name="salary" placeholder="e.g. $120k or $65/hr" onChange={handleChange} />
            </Row>
            <Row>
              <Field label="Bill Rate" name="billRate" placeholder="e.g. $75/hr" onChange={handleChange} />
              <Field label="Pay Rate" name="payRate" placeholder="e.g. $60/hr" onChange={handleChange} />
            </Row>
            <Row>
              <Field label="Required Skills" name="skills" placeholder="e.g. React, Node.js, AWS, Kubernetes..." onChange={handleChange} full />
            </Row>
          </Section>

          {/* SECTION 2: LOCATION */}
          <Section title="Location & Posting" subtitle="Where is this role based and how it will be listed">
            <Row>
              <Field label="City" name="city" placeholder="e.g. Austin" onChange={handleChange} />
              <Field label="Country" name="country" placeholder="e.g. United States" onChange={handleChange} />
            </Row>
            <Row>
              <Field label="Post Info / Job Board" name="postInfo" placeholder="Where should this opening be posted?" onChange={handleChange} full />
            </Row>
          </Section>

          {/* SECTION 3: DESCRIPTION */}
          <Section title="Job Description" subtitle="Detailed description shown to candidates">
            <TextAreaField
              label="Description"
              name="description"
              required
              error={errors.description}
              placeholder="Write a detailed job description including responsibilities, qualifications, and any other relevant information..."
              onChange={handleChange}
            />
          </Section>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-[10px] border border-[#E0DDD6] bg-white px-5.5 py-2.5 text-[13px] font-medium text-[#4A4845]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-[10px] bg-[#1C4ED8] px-6 py-2.5 text-[13px] font-medium text-white shadow-[0_1px_3px_rgba(28,78,216,0.3)]"
            >
              Save Job Opening →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobForm;

/* ──────────────────── INTERNAL COMPONENTS ──────────────────── */

const Section = ({ title, subtitle, children }) => (
  <div className="overflow-hidden rounded-xl border border-[#E8E6E0] bg-white">
    <div className="border-b border-[#F0EDE8] bg-[#FAFAF8] px-5 pt-4 pb-3">
      <div className="text-[13px] font-semibold text-[#1C1B18]">{title}</div>
      {subtitle && <p className="mt-0.5 text-[11.5px] text-[#9B9890]">{subtitle}</p>}
    </div>
    <div className="flex flex-col gap-3.5 px-5 py-4">{children}</div>
  </div>
);

const Row = ({ children }) => (
  <div className="grid grid-cols-2 items-center gap-x-5 gap-y-3">{children}</div>
);

const baseInputClass =
  "min-w-0 flex-1 rounded-lg border bg-white px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 outline-none transition-all duration-150 focus:ring-2";

const inputClass = (hasError) =>
  `${baseInputClass} ${
    hasError
      ? "border-[#FCA5A5] focus:border-[#DC2626] focus:ring-[#DC2626]/15"
      : "focus:border-blue-500 focus:ring-blue-500"
  }`;
const inputBorderStyle = { borderColor: "#d1cdc7" };

const FieldLabel = ({ label, required, alignTop }) => (
  <label
    className={`shrink-0 text-[12.5px] text-gray-500 text-right leading-tight ${
      alignTop ? "pt-2" : ""
    }`}
    style={{ minWidth: "96px" }}
  >
    {label} {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const Field = ({ label, required, full, error, ...props }) => (
  <div className={`flex items-start gap-2.5 ${full ? "col-span-2" : ""}`}>
    <FieldLabel label={label} required={required} />
    <div className="flex min-w-0 flex-1 flex-col">
      <input {...props} className={inputClass(!!error)} style={inputBorderStyle} />
      {error && <span className="mt-1 text-[11px] text-[#DC2626]">{error}</span>}
    </div>
  </div>
);

const SelectField = ({ label, options = [], required, full, error, ...props }) => (
  <div className={`flex items-start gap-2.5 ${full ? "col-span-2" : ""}`}>
    <FieldLabel label={label} required={required} />
    <div className="flex min-w-0 flex-1 flex-col">
      <select
        {...props}
        className={`${inputClass(!!error)} cursor-pointer appearance-none pr-9`}
        style={{
          ...inputBorderStyle,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
        }}
      >
        <option value="">Select status...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 text-[11px] text-[#DC2626]">{error}</span>}
    </div>
  </div>
);

// ─── CLIENT SELECT ────────────────────────────────────────────────────────────
// Searchable, select-only combobox for picking an existing client. Unlike a
// plain text Field, this never lets the user type a value that isn't in the
// `clients` list — onSelect only fires when an actual client row is clicked.
const ClientSelect = ({
  label,
  clients = [],
  loading,
  loadError,
  value,            // currently selected client id (formData.clientId)
  displayValue,     // currently selected client name (formData.client)
  onSelect,
  required,
  error,
}) => {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef(null);

  // Close the dropdown on outside click.
  useEffect(() => {
    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // What the input box shows: the search query while open, the selected
  // client's name while closed.
  const inputValue = open ? query : (displayValue || "");

  const filtered = clients.filter((c) =>
    (c.clientName || "").toLowerCase().includes(query.trim().toLowerCase())
  );

  const handleFocus = () => {
    setQuery("");
    setOpen(true);
  };

  const handlePick = (client) => {
    onSelect(client);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="flex items-start gap-2.5" ref={boxRef}>
      <FieldLabel label={label} required={required} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={handleFocus}
          placeholder={
            loading ? "Loading clients…" : "Search existing clients…"
          }
          disabled={loading || loadError}
          autoComplete="off"
          style={inputBorderStyle}
          className={`${inputClass(!!error)} ${loading || loadError ? "cursor-not-allowed opacity-60" : ""}`}
        />

        {open && !loading && !loadError && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-20 max-h-56 overflow-y-auto rounded-lg border border-[#d1cdc7] bg-white py-1 shadow-lg">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-[12.5px] text-gray-400">
                {clients.length === 0
                  ? "No clients yet — add one in the Clients page first."
                  : "No clients match your search."}
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} // keep focus, avoid blur race
                  onClick={() => handlePick(c)}
                  className={`flex w-full items-center px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-gray-50 ${
                    c.id === value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-800"
                  }`}
                >
                  {c.clientName}
                </button>
              ))
            )}
          </div>
        )}

        {loadError && (
          <span className="mt-1 text-[11px] text-[#DC2626]">
            Couldn't load clients. Refresh and try again.
          </span>
        )}
        {!loadError && !loading && clients.length === 0 && (
          <span className="mt-1 text-[11px] text-gray-400">
            No clients exist yet — create one on the Clients page before posting a job.
          </span>
        )}
        {error && <span className="mt-1 text-[11px] text-[#DC2626]">{error}</span>}
      </div>
    </div>
  );
};

const TextAreaField = ({ label, required, error, ...props }) => (
  <div className="flex items-start gap-2.5">
    <FieldLabel label={label} required={required} alignTop />
    <div className="flex min-w-0 flex-1 flex-col">
      <textarea
        {...props}
        style={inputBorderStyle}
        className={`min-h-40 resize-y rounded-lg border bg-white px-3 py-2 text-[13px] leading-[1.6] text-gray-800 placeholder-gray-400 outline-none transition-all duration-150 focus:ring-2 ${
          error
            ? "border-[#FCA5A5] focus:border-[#DC2626] focus:ring-[#DC2626]/15"
            : "focus:border-blue-500 focus:ring-blue-500"
        }`}
      />
      {error && <span className="mt-1 text-[11px] text-[#DC2626]">{error}</span>}
    </div>
  </div>
);