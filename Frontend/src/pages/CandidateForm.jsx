import React, { useState, useRef } from "react";

/* ──────────────────── COUNTRY & STATE DATA ──────────────────── */

const COUNTRIES = [
  "India",
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France",
  "Singapore", "United Arab Emirates", "Saudi Arabia", "Qatar", "Japan", "China",
  "South Korea", "Netherlands", "Sweden", "Switzerland", "Ireland", "New Zealand",
  "South Africa", "Brazil", "Mexico", "Argentina", "Italy", "Spain", "Belgium",
  "Norway", "Denmark", "Finland", "Poland", "Portugal", "Greece", "Turkey",
  "Russia", "Indonesia", "Malaysia", "Thailand", "Vietnam", "Philippines",
  "Bangladesh", "Pakistan", "Sri Lanka", "Nepal", "Egypt", "Kenya", "Nigeria",
  "Israel", "Hong Kong", "Taiwan",
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = Array.from({ length: 60 }, (_, i) => String(new Date().getFullYear() - i));


/* ──────────────────── MAIN COMPONENT ──────────────────── */

const CandidateForm = ({ setShowForm, onSave }) => {
  const [formData, setFormData] = useState({});
  const [education, setEducation] = useState([{}]);
  const [experience, setExperience] = useState([{}]);
  const [attachments, setAttachments] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateEducation = (i, key, value) => {
    const next = [...education];
    next[i] = { ...next[i], [key]: value };
    setEducation(next);
  };
  const updateExperience = (i, key, value) => {
    const next = [...experience];
    next[i] = { ...next[i], [key]: value };
    setExperience(next);
  };

  const addEducation = () => setEducation([...education, {}]);
  const removeEducation = (i) => {
    if (education.length === 1) return;
    setEducation(education.filter((_, idx) => idx !== i));
  };
  const addExperience = () => setExperience([...experience, {}]);
  const removeExperience = (i) => {
    if (experience.length === 1) return;
    setExperience(experience.filter((_, idx) => idx !== i));
  };

  const handleFile = (key, file) => {
    setAttachments({ ...attachments, [key]: file });
  };

  const handleSubmit = () => {
    onSave({ ...formData, education, experience, attachments });
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
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9B9890]">
              PhiBench
            </div>
            <div className="text-[18px] font-semibold leading-tight text-[#1C1B18]">
              Create Candidate
            </div>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => setShowForm(false)}
            className="rounded-[10px] border border-[#E0DDD6] bg-white px-5 py-2.5 text-[13px] font-medium text-[#4A4845] transition-all hover:bg-[#F5F4F0]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-[10px] bg-[#1C4ED8] px-5.5 py-2.5 text-[13px] font-medium text-white shadow-[0_1px_3px_rgba(28,78,216,0.3)] transition-all hover:bg-[#1741B6] hover:shadow-[0_4px_12px_rgba(28,78,216,0.35)]"
          >
            Save Candidate →
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="mx-auto max-w-7xl px-8 py-8 pb-12">
        <div className="flex flex-col gap-5">
          {/* SECTION 1: BASIC INFO */}
          <Section title="Basic Information" subtitle="Core identity and contact details for this candidate">
            <Row>
              <Field label="First Name" name="firstName" placeholder="Enter first name" onChange={handleChange} required />
              <Field label="Last Name" name="lastName" placeholder="Enter last name" onChange={handleChange} required />
            </Row>
            <Row>
              <Field label="Email" name="email" type="email" placeholder="email@example.com" onChange={handleChange} required />
              <Field label="Phone Number" name="phone" placeholder="+91 9876543210" onChange={handleChange} />
            </Row>
          </Section>

          {/* SECTION 2: ADDRESS */}
          <Section title="Address" subtitle="Where the candidate is currently located">
            <Row>
              <Field label="Street" name="street" placeholder="Street address" onChange={handleChange} full />
            </Row>
            <Row>
              <Field label="City" name="city" placeholder="City" onChange={handleChange} />
              <Field label="Pincode" name="pincode" placeholder="Postal / Zip code" onChange={handleChange} />
            </Row>
            <Row>
              <SelectField
                label="Country"
                name="country"
                options={COUNTRIES}
                placeholder="Select country..."
                onChange={handleChange}
              />
              <SelectField
                label="State"
                name="state"
                options={formData.country === "India" ? INDIAN_STATES : []}
                placeholder={formData.country === "India" ? "Select state..." : "Type or select state"}
                allowFreeText={formData.country !== "India"}
                value={formData.state || ""}
                onChange={handleChange}
              />
            </Row>
          </Section>

          {/* SECTION 3: PROFILE */}
          <Section title="Profile" subtitle="Professional background and compensation details">
            <Row>
              <Field label="Experience (Years)" name="experienceYears" placeholder="e.g. 5" onChange={handleChange} />
              <Field label="Current Job Title" name="jobTitle" placeholder="e.g. Software Engineer" onChange={handleChange} />
            </Row>
            <Row>
              <SelectField
                label="Highest Qualification"
                name="qualification"
                options={["High School", "Diploma", "B.Tech", "B.E.", "B.Sc", "B.Com", "B.A.", "BCA", "MBA", "M.Tech", "M.Sc", "MCA", "Ph.D"]}
                placeholder="Select qualification..."
                onChange={handleChange}
              />
              <CurrencyField label="Expected Salary" name="expectedSalary" placeholder="e.g. 700000" onChange={handleChange} />
            </Row>
            <Row>
              <CurrencyField label="Current Salary" name="currentSalary" placeholder="e.g. 500000" onChange={handleChange} />
              <Field label="LinkedIn" name="linkedin" placeholder="linkedin.com/in/username" onChange={handleChange} />
            </Row>
            <Row>
              <Field label="Skill Details" name="skills" placeholder="e.g. React, Node.js, AWS, Kubernetes..." onChange={handleChange} full />
            </Row>
          </Section>

          {/* SECTION 4: EDUCATIONAL DETAILS */}
          <Section title="Educational Details" subtitle="Academic background — add as many entries as needed">
            <div className="flex flex-col">
              {education.map((edu, i) => (
                <TimelineItem
                  key={i}
                  index={i + 1}
                  isLast={i === education.length - 1}
                  onDelete={education.length > 1 ? () => removeEducation(i) : null}
                >
                  <Field
                    label="Institute / School"
                    placeholder="e.g. IIT Delhi"
                    value={edu.institute || ""}
                    onChange={(e) => updateEducation(i, "institute", e.target.value)}
                  />
                  <Field
                    label="Major / Department"
                    placeholder="e.g. Computer Science"
                    value={edu.major || ""}
                    onChange={(e) => updateEducation(i, "major", e.target.value)}
                  />
                  <Field
                    label="Degree"
                    placeholder="e.g. Bachelor of Technology"
                    value={edu.degree || ""}
                    onChange={(e) => updateEducation(i, "degree", e.target.value)}
                  />
                  <DurationField
                    label="Duration"
                    fromMonth={edu.fromMonth}
                    fromYear={edu.fromYear}
                    toMonth={edu.toMonth}
                    toYear={edu.toYear}
                    onChange={(key, value) => updateEducation(i, key, value)}
                  />
                  <CheckboxField
                    label="Currently pursuing"
                    checked={!!edu.pursuing}
                    onChange={(checked) => updateEducation(i, "pursuing", checked)}
                  />
                </TimelineItem>
              ))}
              <AddRowButton text="Add Educational Details" onClick={addEducation} />
            </div>
          </Section>

          {/* SECTION 5: EXPERIENCE DETAILS */}
          <Section title="Experience Details" subtitle="Work history — add as many entries as needed">
            <div className="flex flex-col">
              {experience.map((exp, i) => (
                <TimelineItem
                  key={i}
                  index={i + 1}
                  isLast={i === experience.length - 1}
                  onDelete={experience.length > 1 ? () => removeExperience(i) : null}
                >
                  <Field
                    label="Occupation / Title"
                    placeholder="e.g. Senior Software Engineer"
                    value={exp.title || ""}
                    onChange={(e) => updateExperience(i, "title", e.target.value)}
                  />
                  <Field
                    label="Company"
                    placeholder="Company name"
                    value={exp.company || ""}
                    onChange={(e) => updateExperience(i, "company", e.target.value)}
                  />
                  <TextAreaField
                    label="Summary"
                    placeholder="Brief description of role and responsibilities"
                    value={exp.summary || ""}
                    onChange={(e) => updateExperience(i, "summary", e.target.value)}
                    short
                  />
                  <DurationField
                    label="Work Duration"
                    fromMonth={exp.fromMonth}
                    fromYear={exp.fromYear}
                    toMonth={exp.toMonth}
                    toYear={exp.toYear}
                    onChange={(key, value) => updateExperience(i, key, value)}
                  />
                  <CheckboxField
                    label="I currently work here"
                    checked={!!exp.current}
                    onChange={(checked) => updateExperience(i, "current", checked)}
                  />
                </TimelineItem>
              ))}
              <AddRowButton text="Add Experience Details" onClick={addExperience} />
            </div>
          </Section>

          {/* SECTION 6: ATTACHMENTS */}
          <Section title="Attachment Information" subtitle="Upload supporting documents for this candidate">
            <Row>
              <FileField label="Resume" file={attachments.resume} onFile={(f) => handleFile("resume", f)} required />
              <FileField label="Formatted Resume" file={attachments.formattedResume} onFile={(f) => handleFile("formattedResume", f)} />
            </Row>
            <Row>
              <FileField label="Other Documents" file={attachments.other} onFile={(f) => handleFile("other", f)} />
            </Row>
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
              Save Candidate →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateForm;


/* ──────────────────── INTERNAL COMPONENTS ──────────────────── */

const Section = ({ title, subtitle, children }) => (
  <div className="overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white">
    <div className="border-b border-[#F0EDE8] bg-[#FAFAF8] px-8 pt-5 pb-4.5">
      <div className="text-[16px] font-semibold text-[#1C1B18]">{title}</div>
      {subtitle && <p className="mt-1 text-[13px] text-[#9B9890]">{subtitle}</p>}
    </div>
    <div className="flex flex-col gap-4.5 px-8 py-5">{children}</div>
  </div>
);

const Row = ({ children }) => (
  <div className="grid grid-cols-2 items-center gap-x-18">{children}</div>
);

const fieldInputClass =
  "min-w-0 flex-1 rounded-[10px] border border-[#E0DDD6] bg-[#FAFAF8] px-3.5 py-2.5 text-[14px] text-[#1C1B18] outline-none transition-all focus:border-[#93AEFF] focus:bg-white focus:ring-[3px] focus:ring-[#6382FF]/20";

const FieldLabel = ({ label, required, alignTop }) => (
  <label
    className={`w-37.5 shrink-0 text-[13px] font-medium tracking-[0.01em] text-[#4A4845] ${
      alignTop ? "pt-3" : ""
    }`}
  >
    {label} {required && <span className="text-[#DC2626]">*</span>}
  </label>
);

const Field = ({ label, required, full, ...props }) => (
  <div className={`flex items-center gap-4 ${full ? "col-span-2" : ""}`}>
    <FieldLabel label={label} required={required} />
    <input {...props} className={fieldInputClass} />
  </div>
);

const CurrencyField = ({ label, required, full, ...props }) => (
  <div className={`flex items-center gap-4 ${full ? "col-span-2" : ""}`}>
    <FieldLabel label={label} required={required} />
    <div className="relative min-w-0 flex-1">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#9B9890]">
        ₹
      </span>
      <input {...props} className={`${fieldInputClass} w-full pl-7.5`} />
    </div>
  </div>
);

const SelectField = ({ label, options = [], required, full, placeholder = "Select...", allowFreeText, value, ...props }) => {
  if (allowFreeText) {
    return (
      <div className={`flex items-center gap-4 ${full ? "col-span-2" : ""}`}>
        <FieldLabel label={label} required={required} />
        <input {...props} value={value} placeholder={placeholder} className={fieldInputClass} />
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-4 ${full ? "col-span-2" : ""}`}>
      <FieldLabel label={label} required={required} />
      <select
        {...props}
        value={value}
        className={`${fieldInputClass} cursor-pointer appearance-none bg-size-[12px_12px] bg-position-[right_14px_center] bg-no-repeat pr-9`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9890' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
};

const TextAreaField = ({ label, required, short, ...props }) => (
  <div className="flex items-start gap-4">
    <FieldLabel label={label} required={required} alignTop />
    <textarea
      {...props}
      className={`${
        short ? "min-h-22.5" : "min-h-30"
      } min-w-0 flex-1 resize-y rounded-xl border border-[#E0DDD6] bg-[#FAFAF8] px-3.5 py-3 text-[14px] leading-[1.6] text-[#1C1B18] outline-none transition-all focus:border-[#93AEFF] focus:bg-white focus:ring-[3px] focus:ring-[#6382FF]/20`}
    />
  </div>
);

const CheckboxField = ({ label, checked, onChange }) => (
  <div className="flex items-center gap-4">
    <FieldLabel label={label} />
    <div className="min-w-0 flex-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4.5 w-4.5 cursor-pointer accent-[#1C4ED8]"
      />
    </div>
  </div>
);

/* ──────── DURATION (Month / Year → Month / Year) ──────── */

const DurationField = ({ label, fromMonth, fromYear, toMonth, toYear, onChange }) => {
  const miniSelect = (val, placeholder, options, key) => (
    <select
      value={val || ""}
      onChange={(e) => onChange(key, e.target.value)}
      className={`min-w-0 flex-1 cursor-pointer appearance-none rounded-[10px] border border-[#E0DDD6] bg-[#FAFAF8] bg-size-[12px_12px] bg-position-[right_10px_center] bg-no-repeat py-2.5 pl-3 pr-7 text-[13px] outline-none ${
        val ? "text-[#1C1B18]" : "text-[#9B9890]"
      }`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9890' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );

  return (
    <div className="flex items-center gap-4">
      <FieldLabel label={label} />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {miniSelect(fromMonth, "Month", MONTHS, "fromMonth")}
        {miniSelect(fromYear, "Year", YEARS, "fromYear")}
        <span className="px-1 text-[13px] text-[#9B9890]">To</span>
        {miniSelect(toMonth, "Month", MONTHS, "toMonth")}
        {miniSelect(toYear, "Year", YEARS, "toYear")}
      </div>
    </div>
  );
};

/* ──────── TIMELINE ITEM ──────── */

const TimelineItem = ({ index, isLast, onDelete, children }) => (
  <div className={`flex gap-5 ${isLast ? "pb-2" : "pb-8"}`}>
    {/* Timeline gutter */}
    <div className="relative flex w-10 shrink-0 flex-col items-center">
      <div className="z-2 flex h-8 w-8 items-center justify-center rounded-full border border-[#E0DDD6] bg-white text-[12px] font-semibold text-[#6B6860]">
        {index}
      </div>
      <div className="my-1 w-px flex-1 bg-[#E8E6E0]" />
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          title="Delete entry"
          className="z-2 flex h-8 w-8 items-center justify-center rounded-full border border-[#FECACA] bg-white text-[#DC2626] transition-all hover:border-[#DC2626] hover:bg-[#FEF2F2]"
        >
          <TrashIcon />
        </button>
      ) : (
        <div className="h-8 w-8 rounded-full border border-dashed border-[#E0DDD6] bg-white" />
      )}
    </div>

    {/* Fields */}
    <div className="flex min-w-0 flex-1 flex-col gap-3.5 pt-0.5">{children}</div>
  </div>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

const AddRowButton = ({ text, onClick }) => (
  <div className="mt-1 flex pl-15">
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#BFD3FF] bg-[#F0F5FF] px-4 py-2 text-[13px] font-medium text-[#1C4ED8] transition-all hover:border-[#93AEFF] hover:bg-[#E4ECFF]"
    >
      <span className="text-base leading-none">+</span> {text}
    </button>
  </div>
);

/* ──────── FILE FIELD ──────── */

const FileField = ({ label, file, onFile,required  }) => {
  const inputRef = useRef(null);
  const handleClick = () => inputRef.current?.click();
  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) onFile(e.target.files[0]);
  };

  return (
    <div className="flex items-center gap-4">
      <FieldLabel label={label} required={required}/>
      <div className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-[10px] border border-[#E0DDD6] bg-[#FAFAF8]">
        <button
          type="button"
          onClick={handleClick}
          className="border-r border-[#E0DDD6] bg-white px-4 py-2.5 text-[13px] font-medium text-[#4A4845] transition-colors hover:bg-[#F5F4F0]"
        >
          Browse
        </button>
        <div
          className={`flex min-w-0 flex-1 items-center overflow-hidden whitespace-nowrap px-3.5 py-2.5 text-[13px] ${
            file ? "text-[#1C1B18]" : "text-[#9B9890]"
          }`}
          style={{ textOverflow: "ellipsis" }}
        >
          {file ? file.name : "No file selected"}
        </div>
        <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />
      </div>
    </div>
  );
};
