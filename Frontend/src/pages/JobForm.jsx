import React, { useState } from "react";

const JobForm = ({ setShowForm, onSave }) => {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
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
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9B9890]">
              PhiBench
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
            className="rounded-[10px] bg-[#1C4ED8] px-[22px] py-2.5 text-[13px] font-medium text-white shadow-[0_1px_3px_rgba(28,78,216,0.3)] transition-all hover:bg-[#1741B6] hover:shadow-[0_4px_12px_rgba(28,78,216,0.35)]"
          >
            Save Job Opening →
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="mx-auto max-w-[1280px] px-8 py-8 pb-12">
        <div className="flex flex-col gap-5">
          {/* SECTION 1: JOB INFO */}
          <Section title="Job Info" subtitle="Core details about the position and assignment">
            <Row>
              <Field label="Position Title" name="title" placeholder="e.g. Senior Java Developer" onChange={handleChange} required />
              <Field label="Client Name" name="client" placeholder="Client company name" onChange={handleChange} required />
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
              placeholder="Write a detailed job description including responsibilities, qualifications, and any other relevant information..."
              onChange={handleChange}
            />
          </Section>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-[10px] border border-[#E0DDD6] bg-white px-[22px] py-2.5 text-[13px] font-medium text-[#4A4845]"
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
  <div className="overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white">
    <div className="border-b border-[#F0EDE8] bg-[#FAFAF8] px-8 pt-5 pb-[18px]">
      <div className="text-[16px] font-semibold text-[#1C1B18]">{title}</div>
      {subtitle && <p className="mt-1 text-[13px] text-[#9B9890]">{subtitle}</p>}
    </div>
    <div className="flex flex-col gap-[18px] px-8 py-5">{children}</div>
  </div>
);

const Row = ({ children }) => (
  <div className="grid grid-cols-2 items-center gap-x-[72px]">{children}</div>
);

const fieldInputClass =
  "min-w-0 flex-1 rounded-[10px] border border-[#E0DDD6] bg-[#FAFAF8] px-3.5 py-2.5 text-[14px] text-[#1C1B18] outline-none transition-all focus:border-[#93AEFF] focus:bg-white focus:ring-[3px] focus:ring-[#6382FF]/20";

const FieldLabel = ({ label, required, alignTop }) => (
  <label
    className={`w-[150px] flex-shrink-0 text-[13px] font-medium tracking-[0.01em] text-[#4A4845] ${
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

const SelectField = ({ label, options = [], required, full, ...props }) => (
  <div className={`flex items-center gap-4 ${full ? "col-span-2" : ""}`}>
    <FieldLabel label={label} required={required} />
    <select
      {...props}
      className={`${fieldInputClass} cursor-pointer appearance-none bg-[length:12px_12px] bg-[right_14px_center] bg-no-repeat pr-9`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9890' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
      }}
    >
      <option value="">Select status...</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

const TextAreaField = ({ label, required, ...props }) => (
  <div className="flex items-start gap-4">
    <FieldLabel label={label} required={required} alignTop />
    <textarea
      {...props}
      className="min-h-[260px] min-w-0 flex-1 resize-y rounded-xl border border-[#E0DDD6] bg-[#FAFAF8] px-4 py-3.5 text-[14px] leading-[1.7] text-[#1C1B18] outline-none transition-all focus:border-[#93AEFF] focus:bg-white focus:ring-[3px] focus:ring-[#6382FF]/20"
    />
  </div>
);