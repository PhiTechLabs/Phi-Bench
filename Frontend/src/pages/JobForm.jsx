import React, { useState, useEffect, useRef } from "react";
import { getAllClients } from "../api/clientApi";
import { getNextCodePreview } from "../api/codePreviewApi";
import axiosInstance from "../api/axiosInstance";
import ErrorModal from "../components/shared/ErrorModal";
import { parseApiError } from "../utils/apiError";

const JOB_REQUIRED_FIELDS = ["title", "clientId", "description"];

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Japan",
  "China",
  "South Korea",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "Ireland",
  "New Zealand",
  "South Africa",
  "Brazil",
  "Mexico",
  "Argentina",
  "Italy",
  "Spain",
  "Belgium",
  "Norway",
  "Denmark",
  "Finland",
  "Poland",
  "Portugal",
  "Greece",
  "Turkey",
  "Russia",
  "Indonesia",
  "Malaysia",
  "Thailand",
  "Vietnam",
  "Philippines",
  "Bangladesh",
  "Pakistan",
  "Sri Lanka",
  "Nepal",
  "Egypt",
  "Kenya",
  "Nigeria",
  "Israel",
  "Hong Kong",
  "Taiwan",
];

const JobForm = ({ setShowForm, onSave, initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Seed all form fields when editing an existing job.
  // Runs once on mount when initialData is provided.
  useEffect(() => {
    if (!initialData) return;
    setFormData({
      title:        initialData.title        || "",
      clientId:     initialData.clientId     || "",
      client:       initialData.client       || "",
      description:  initialData.description  || "",
      status:       initialData.status       || "Open",
      contact:      initialData.contact      || "",
      contactPhone: initialData.contactPhone || "",
      manager:      initialData.manager      || "",
      recruiter:    initialData.recruiter    || "",
      jobType:      initialData.jobType      || "",
      experience:   initialData.experience   || "",
      industry:     initialData.industry     || "",
      salary:       initialData.salary       || "",
      billRate:     initialData.billRate     || "",
      payRate:      initialData.payRate      || "",
      skills:       initialData.skills       || "",
      city:         initialData.city         || "",
      country:      initialData.country      || "",
      postInfo:     initialData.postInfo     || "",
      dateOpened:   initialData.dateOpened   ? initialData.dateOpened.substring(0, 10) : "",
      targetDate:   initialData.targetDate   ? initialData.targetDate.substring(0, 10)  : "",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  const fieldRefs = useRef(
    Object.fromEntries(JOB_REQUIRED_FIELDS.map((k) => [k, React.createRef()]))
  );

  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    for (const key of JOB_REQUIRED_FIELDS) {
      if (errors[key] && fieldRefs.current[key]?.current) {
        fieldRefs.current[key].current.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      }
    }
  }, [errors]);

  // ─── CLIENT LIST ─────────────────────────────────────────────────────────
  const [clients, setClients]               = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError,   setClientsError]   = useState(false);

  // ─── ALL USERS (for Account Manager / Assign Recruiter pickers) ───────────
  const [users, setUsers]               = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [nextCode, setNextCode] = useState(null);

  useEffect(() => {
    if (isEdit) return; // no code preview needed for edits
    (async () => {
      try {
        const code = await getNextCodePreview("job");
        setNextCode(code);
      } catch (err) {
        console.warn("Failed to preview next job code:", err?.response?.data || err);
      }
    })();
  }, [isEdit]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllClients();
        const list = Array.isArray(data) ? data : (data?.clients || []);
        setClients(
          list.map((c) => ({
            id:             c._id || c.id,
            clientName:     c.clientName,
            accountManager: c.accountManager || "",
            pocs:           (c.pocs || []).map((p) => ({
              name:    `${p.firstName || ""} ${p.lastName || ""}`.trim(),
              contact: p.contact || "",
              email:   p.email   || "",
            })).filter((p) => p.name),
          }))
        );
      } catch (err) {
        console.warn("Failed to load clients:", err?.response?.data || err);
        setClientsError(true);
      } finally {
        setClientsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Use /users/picker — accessible by any authenticated user, no special
        // permissions required. The full /users endpoint needs users.view which
        // non-admin roles don't have.
        const res = await axiosInstance.get("/auth/users/picker");
        const list = res.data?.users || [];
        setUsers(list.map((u) => ({
          id:       u.id,
          username: u.username,
          role:     u.role || "",
        })));
      } catch (err) {
        console.warn("Failed to load users:", err?.response?.data || err);
      } finally {
        setUsersLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleClientSelect = (client) => {
    setFormData((f) => ({
      ...f,
      clientId:     client.id,
      client:       client.clientName,
      // clear contact fields when switching clients
      contact:      "",
      contactPhone: "",
    }));
    if (errors.clientId) {
      setErrors((e) => ({ ...e, clientId: undefined }));
    }
  };

  const handleSubmit = async () => {
    const validationErrors = {};
    if (!formData.title?.trim())       validationErrors.title       = "Position title is required";
    if (!formData.clientId)            validationErrors.clientId    = "Please select an existing client";
    if (!formData.description?.trim()) validationErrors.description = "Job description is required";
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSave(formData);
    } catch (err) {
      setFormError(parseApiError(err, "Failed to create job opening"));
    } finally {
      setSubmitting(false);
    }
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
              {!isEdit && nextCode && (
                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                  Next code: {nextCode}
                </span>
              )}
              {isEdit && initialData?.code && (
                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                  {initialData.code}
                </span>
              )}
            </div>
            <div className="text-[18px] font-semibold leading-tight text-[#1C1B18]">
              {isEdit ? "Edit Job Opening" : "New Job Opening"}
            </div>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => setShowForm(false)}
            disabled={submitting}
            className="rounded-[10px] border border-[#E0DDD6] bg-white px-5 py-2.5 text-[13px] font-medium text-[#4A4845] transition-all hover:bg-[#F5F4F0] disabled:opacity-50"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-[10px] bg-[#1C4ED8] px-5.5 py-2.5 text-[13px] font-medium text-white shadow-[0_1px_3px_rgba(28,78,216,0.3)] transition-all hover:bg-[#1741B6] hover:shadow-[0_4px_12px_rgba(28,78,216,0.35)] disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEdit ? "Save Changes →" : "Save Job Opening →"}
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="mx-auto max-w-5xl px-6 py-6 pb-10">

        <div className="flex flex-col gap-4">
          {/* SECTION 1: JOB INFO */}
          <Section title="Job Info" subtitle="Core details about the position and assignment">
            <Row>
              <Field label="Position Title" name="title" value={formData.title || ""} placeholder="e.g. Senior Java Developer" onChange={handleChange} required error={errors.title} wrapperRef={fieldRefs.current.title} />
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
                wrapperRef={fieldRefs.current.clientId}
              />
            </Row>
            <Row>
              <PocSelect
                label="Contact Name"
                pocs={(() => {
                  const sel = clients.find((c) => c.id === formData.clientId);
                  return sel?.pocs || [];
                })()}
                hasClient={!!formData.clientId}
                value={formData.contact || ""}
                onSelect={(poc) => {
                  setFormData((f) => ({
                    ...f,
                    contact:      poc.name,
                    contactPhone: poc.contact || "",
                  }));
                }}
                onClear={() => setFormData((f) => ({ ...f, contact: "", contactPhone: "" }))}
              />
              <Field
                label="Contact Number"
                name="contactPhone"
                value={formData.contactPhone || ""}
                placeholder="Auto-filled from POC"
                onChange={handleChange}
              />
            </Row>
            <Row>
              <UserSelect
                label="Account Manager"
                users={users}
                loading={usersLoading}
                value={formData.manager || ""}
                onSelect={(username) => setFormData((f) => ({ ...f, manager: username }))}
                onClear={() => setFormData((f) => ({ ...f, manager: "" }))}
              />
            </Row>
            <Row>
              <UserSelect
                label="Assign Recruiter"
                users={users}
                loading={usersLoading}
                value={formData.recruiter || ""}
                onSelect={(username) => setFormData((f) => ({ ...f, recruiter: username }))}
                onClear={() => setFormData((f) => ({ ...f, recruiter: "" }))}
              />
              <SelectField
                label="Job Status"
                name="status"
                value={formData.status || ""}
                options={["Open", "Closed", "On Hold", "Filled"]}
                onChange={handleChange}
              />
            </Row>
            <Row>
              <Field label="Date Opened" name="dateOpened" type="date" value={formData.dateOpened || ""} onChange={handleChange} />
              <Field label="Target Date"  name="targetDate"  type="date" value={formData.targetDate  || ""} onChange={handleChange} />
            </Row>
            <Row>
              <SelectField
                label="Job Type"
                name="jobType"
                value={formData.jobType || ""}
                onChange={handleChange}
                options={["Full-Time", "Part-Time", "Contract", "Contract-to-Hire", "C2C", "Freelance", "Internship", "Temporary"]}
                placeholder="Select job type"
              />
              <Field label="Work Experience" name="experience"  value={formData.experience  || ""} placeholder="e.g. 5+ years"              onChange={handleChange} />
            </Row>
            <Row>
              <Field label="Industry"      name="industry" value={formData.industry || ""} placeholder="e.g. Fintech, Healthcare"     onChange={handleChange} />
              <Field label="Salary / Rate" name="salary"   value={formData.salary   || ""} placeholder="e.g. ₹8,00,000 or ₹650/hr"  onChange={handleChange} />
            </Row>
            <Row>
              <Field label="Bill Rate" name="billRate" value={formData.billRate || ""} placeholder="e.g. ₹750/hr"  onChange={handleChange} />
              <Field label="Pay Rate"  name="payRate"  value={formData.payRate  || ""} placeholder="e.g. ₹600/hr"  onChange={handleChange} />
            </Row>
            <Row>
              <Field label="Required Skills" name="skills" value={formData.skills || ""} placeholder="e.g. React, Node.js, AWS, Kubernetes..." onChange={handleChange} full />
            </Row>
          </Section>

          {/* SECTION 2: LOCATION */}
          <Section title="Location & Posting" subtitle="Where is this role based and how it will be listed">
            <Row>
              <Field label="City"    name="city"    value={formData.city    || ""} placeholder="e.g. Austin"         onChange={handleChange} />
              <SelectField
                label="Country"
                name="country"
                value={formData.country || ""}
                onChange={handleChange}
                options={COUNTRIES}
                placeholder="Select country"
              />
            </Row>
            <Row>
              <Field label="Post Info / Job Board" name="postInfo" value={formData.postInfo || ""} placeholder="Where should this opening be posted?" onChange={handleChange} full />
            </Row>
          </Section>

          {/* SECTION 3: DESCRIPTION */}
          <Section title="Job Description" subtitle="Detailed description shown to candidates">
            <TextAreaField
              label="Description"
              name="description"
              value={formData.description || ""}
              required
              error={errors.description}
              placeholder="Write a detailed job description including responsibilities, qualifications, and any other relevant information..."
              onChange={handleChange}
              wrapperRef={fieldRefs.current.description}
            />
          </Section>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              onClick={() => setShowForm(false)}
              disabled={submitting}
              className="rounded-[10px] border border-[#E0DDD6] bg-white px-5.5 py-2.5 text-[13px] font-medium text-[#4A4845] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-[10px] bg-[#1C4ED8] px-6 py-2.5 text-[13px] font-medium text-white shadow-[0_1px_3px_rgba(28,78,216,0.3)] disabled:opacity-50"
            >
              {submitting ? "Saving..." : isEdit ? "Save Changes →" : "Save Job Opening →"}
            </button>
          </div>
        </div>
      </div>

      {formError && (
        <ErrorModal
          title={formError.title}
          message={formError.message}
          errors={formError.errors}
          onClose={() => setFormError(null)}
        />
      )}
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
      alignTop ? "pt-2" : "pt-[7px]"
    }`}
    style={{ minWidth: "96px" }}
  >
    {label} {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const Field = ({ label, required, full, error, wrapperRef, ...props }) => (
  <div ref={wrapperRef} className={`flex items-start gap-2.5 ${full ? "col-span-2" : ""}`}>
    <FieldLabel label={label} required={required} />
    <div className="flex min-w-0 flex-1 flex-col">
      <input
        {...props}
        className={inputClass(!!error)}
        style={error ? { backgroundColor: "#FFF5F5" } : inputBorderStyle}
      />
      {error && <span className="mt-1 text-[11px] text-[#DC2626]">{error}</span>}
    </div>
  </div>
);

const SelectField = ({ label, options = [], required, full, error, wrapperRef, placeholder = "Select...", ...props }) => (
  <div ref={wrapperRef} className={`flex items-start gap-2.5 ${full ? "col-span-2" : ""}`}>
    <FieldLabel label={label} required={required} />
    <div className="flex min-w-0 flex-1 flex-col">
      <select
        {...props}
        className={`${inputClass(!!error)} cursor-pointer appearance-none pr-9`}
        style={{
          ...(error ? { backgroundColor: "#FFF5F5" } : inputBorderStyle),
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
        }}
      >
        <option value="">{placeholder}</option>
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
  value,
  displayValue,
  onSelect,
  required,
  error,
  wrapperRef,
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
    <div className="flex items-start gap-2.5" ref={wrapperRef || boxRef}>
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
          style={error ? { backgroundColor: "#FFF5F5" } : inputBorderStyle}
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

// ─── POC SELECT ──────────────────────────────────────────────────────────────
// Searchable combobox for picking a POC from the selected client's POC list.
// Same interaction model as ClientSelect — type to filter, click to confirm.
// Auto-fills contactPhone when a POC with a phone number is picked.
const PocSelect = ({ label, pocs = [], hasClient, value, onSelect, onClear }) => {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = pocs.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const inputValue = open ? query : (value || "");

  const placeholder = !hasClient
    ? "Select a client first"
    : pocs.length === 0
    ? "No POCs on this client"
    : "Search contact name…";

  return (
    <div className="flex items-start gap-2.5" ref={boxRef}>
      <FieldLabel label={label} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setQuery(""); setOpen(true); }}
          placeholder={placeholder}
          disabled={!hasClient || pocs.length === 0}
          autoComplete="off"
          style={inputBorderStyle}
          className={`${inputClass(false)} ${(!hasClient || pocs.length === 0) ? "cursor-not-allowed opacity-60" : ""}`}
        />
        {/* Clear button */}
        {value && (
          <button type="button" onMouseDown={(e) => { e.preventDefault(); onClear(); setQuery(""); setOpen(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9B9890] hover:text-[#DC2626] text-[11px]">
            ✕
          </button>
        )}
        {open && pocs.length > 0 && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-20 max-h-52 overflow-y-auto rounded-lg border border-[#d1cdc7] bg-white py-1 shadow-lg">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-[12.5px] text-gray-400">No POCs match your search.</div>
            ) : (
              filtered.map((poc, i) => (
                <button key={i} type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onSelect(poc); setQuery(""); setOpen(false); }}
                  className={`flex w-full flex-col px-3 py-1.5 text-left transition-colors hover:bg-gray-50 ${
                    value === poc.name ? "bg-blue-50" : ""
                  }`}>
                  <span className={`text-[13px] ${value === poc.name ? "font-medium text-blue-700" : "text-gray-800"}`}>
                    {poc.name}
                  </span>
                  {poc.contact && (
                    <span className="text-[11px] text-gray-400">{poc.contact}</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── USER SELECT ──────────────────────────────────────────────────────────────
// Searchable combobox listing ALL system users (any role, any branch).
// Used for Account Manager — lets recruiter pick any user regardless of role.
const UserSelect = ({ label, users = [], loading, value, onSelect, onClear }) => {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(query.trim().toLowerCase()) ||
    u.role.toLowerCase().includes(query.trim().toLowerCase())
  );

  const inputValue = open ? query : (value || "");

  return (
    <div className="flex items-start gap-2.5" ref={boxRef}>
      <FieldLabel label={label} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setQuery(""); setOpen(true); }}
          placeholder={loading ? "Loading users…" : "Search account manager…"}
          disabled={loading}
          autoComplete="off"
          style={inputBorderStyle}
          className={`${inputClass(false)} ${loading ? "cursor-not-allowed opacity-60" : ""}`}
        />
        {/* Clear button */}
        {value && (
          <button type="button" onMouseDown={(e) => { e.preventDefault(); onClear(); setQuery(""); setOpen(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9B9890] hover:text-[#DC2626] text-[11px]">
            ✕
          </button>
        )}
        {open && !loading && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-20 max-h-52 overflow-y-auto rounded-lg border border-[#d1cdc7] bg-white py-1 shadow-lg">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-[12.5px] text-gray-400">
                {users.length === 0 ? "No users found." : "No users match your search."}
              </div>
            ) : (
              filtered.map((u) => (
                <button key={u.id} type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onSelect(u.username); setQuery(""); setOpen(false); }}
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-left transition-colors hover:bg-gray-50 ${
                    value === u.username ? "bg-blue-50" : ""
                  }`}>
                  <span className={`text-[13px] ${value === u.username ? "font-medium text-blue-700" : "text-gray-800"}`}>
                    {u.username}
                  </span>
                  {u.role && (
                    <span className="text-[11px] text-gray-400 ml-2">{u.role}</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TextAreaField = ({ label, required, error, wrapperRef, ...props }) => (
  <div ref={wrapperRef} className="flex items-start gap-2.5">
    <FieldLabel label={label} required={required} alignTop />
    <div className="flex min-w-0 flex-1 flex-col">
      <textarea
        {...props}
        style={error ? { backgroundColor: "#FFF5F5" } : inputBorderStyle}
        className={`min-h-40 resize-y rounded-lg border px-3 py-2 text-[13px] leading-[1.6] text-gray-800 outline-none transition-all duration-150 focus:ring-2 ${
          error
            ? "border-[#FCA5A5] placeholder-red-300 focus:border-[#DC2626] focus:ring-[#DC2626]/15"
            : "bg-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
        }`}
      />
      {error && <span className="mt-1 text-[11px] text-[#DC2626]">{error}</span>}
    </div>
  </div>
);