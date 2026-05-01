import React, { useState } from "react";

const JobForm = ({ setShowForm, onSave }) => {
  const [formData, setFormData] = useState({});
  const [activeSection, setActiveSection] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const sections = ["Job Info", "Location & Post", "Description"];

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", minHeight: "100vh", background: "#F5F4F0" }}>

      {/* HEADER */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E8E6E0",
        padding: "0 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "64px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <button
            onClick={() => setShowForm(false)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "36px", height: "36px", borderRadius: "10px",
              border: "1px solid #E0DDD6", background: "white",
              cursor: "pointer", color: "#6B6860", fontSize: "18px",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#F5F4F0"}
            onMouseLeave={e => e.currentTarget.style.background = "white"}
          >
            ←
          </button>
          <div>
            <div style={{ fontSize: "11px", color: "#9B9890", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>PhiBench</div>
            <div style={{ fontSize: "18px", fontWeight: 600, color: "#1C1B18", lineHeight: 1.2, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>New Job Opening</div>
          </div>
        </div>

        {/* STEP INDICATOR */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {sections.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSection(i)}
              style={{
                padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
                border: "none", cursor: "pointer",
                background: activeSection === i ? "#1C1B18" : "transparent",
                color: activeSection === i ? "white" : "#9B9890",
                transition: "all 0.2s",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowForm(false)}
            style={{
              padding: "9px 20px", borderRadius: "10px",
              border: "1px solid #E0DDD6", background: "white",
              fontSize: "13px", fontWeight: 500, color: "#4A4845", cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#F5F4F0"}
            onMouseLeave={e => e.currentTarget.style.background = "white"}
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "9px 22px", borderRadius: "10px",
              border: "none", background: "#1C4ED8",
              fontSize: "13px", fontWeight: 500, color: "white", cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: "0 1px 3px rgba(28,78,216,0.3)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1741B6"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(28,78,216,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1C4ED8"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(28,78,216,0.3)"; }}
          >
            Save Job Opening →
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem 2rem" }}>

        {/* FORM AREA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* SECTION 1: JOB INFO */}
          <Section title="Job Info" subtitle="Core details about the position and assignment" visible={activeSection === 0}>
            <TwoCol>
              <Field label="Position Title" name="title" placeholder="e.g. Senior Java Developer" onChange={handleChange} required />
              <Field label="Client Name" name="client" placeholder="Client company name" onChange={handleChange} required />
            </TwoCol>
            <TwoCol>
              <Field label="Contact Name" name="contact" placeholder="Hiring manager" onChange={handleChange} />
              <Field label="Account Manager" name="manager" placeholder="Internal AM" onChange={handleChange} />
            </TwoCol>
            <TwoCol>
              <Field label="Assign Recruiter" name="recruiter" placeholder="Recruiter name" onChange={handleChange} />
              <SelectField
                label="Job Status" name="status"
                options={["Open", "Closed", "On Hold", "Filled"]}
                onChange={handleChange}
              />
            </TwoCol>
            <TwoCol>
              <Field label="Date Opened" name="dateOpened" type="date" onChange={handleChange} />
              <Field label="Target Date" name="targetDate" type="date" onChange={handleChange} />
            </TwoCol>
            <TwoCol>
              <Field label="Job Type" name="jobType" placeholder="Full-time / Contract / C2C" onChange={handleChange} />
              <Field label="Work Experience" name="experience" placeholder="e.g. 5+ years" onChange={handleChange} />
            </TwoCol>
            <TwoCol>
              <Field label="Industry" name="industry" placeholder="e.g. Fintech, Healthcare" onChange={handleChange} />
              <Field label="Salary / Rate" name="salary" placeholder="e.g. $120k or $65/hr" onChange={handleChange} />
            </TwoCol>
            <Field label="Required Skills" name="skills" placeholder="e.g. React, Node.js, AWS, Kubernetes..." onChange={handleChange} full />
          </Section>

          {/* SECTION 2: LOCATION */}
          <Section title="Location & Posting" subtitle="Where is this role based and how it will be listed" visible={activeSection === 1}>
            <TwoCol>
              <Field label="City" name="city" placeholder="e.g. Austin" onChange={handleChange} />
              <Field label="Country" name="country" placeholder="e.g. United States" onChange={handleChange} />
            </TwoCol>
            <Field label="Post Info / Job Board Details" name="postInfo" placeholder="Where should this opening be posted?" onChange={handleChange} full />
          </Section>

          {/* SECTION 3: DESCRIPTION */}
          <Section title="Job Description" subtitle="Detailed description shown to candidates" visible={activeSection === 2}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#4A4845", display: "block", marginBottom: "8px", letterSpacing: "0.02em" }}>
                Description <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <textarea
                name="description"
                onChange={handleChange}
                placeholder="Write a detailed job description including responsibilities, qualifications, and any other relevant information..."
                style={{
                  width: "100%", minHeight: "280px",
                  padding: "14px 16px",
                  border: "1px solid #E0DDD6",
                  borderRadius: "12px",
                  fontSize: "14px", lineHeight: "1.7",
                  color: "#1C1B18",
                  background: "#FAFAF8",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={e => { e.target.style.borderColor = "#93AEFF"; e.target.style.boxShadow = "0 0 0 3px rgba(99,130,255,0.12)"; e.target.style.background = "white"; }}
                onBlur={e => { e.target.style.borderColor = "#E0DDD6"; e.target.style.boxShadow = "none"; e.target.style.background = "#FAFAF8"; }}
              />
            </div>
          </Section>

          {/* NAVIGATION BUTTONS */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px" }}>
            <button
              onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
              style={{
                padding: "10px 20px", borderRadius: "10px",
                border: "1px solid #E0DDD6", background: "white",
                fontSize: "13px", fontWeight: 500,
                color: activeSection === 0 ? "#C0BDB6" : "#4A4845",
                cursor: activeSection === 0 ? "default" : "pointer",
              }}
            >
              ← Previous
            </button>

            {activeSection < 2 ? (
              <button
                onClick={() => setActiveSection(Math.min(2, activeSection + 1))}
                style={{
                  padding: "10px 22px", borderRadius: "10px",
                  border: "none", background: "#1C1B18",
                  fontSize: "13px", fontWeight: 500, color: "white", cursor: "pointer",
                }}
              >
                Next → {sections[activeSection + 1]}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                style={{
                  padding: "10px 22px", borderRadius: "10px",
                  border: "none", background: "#1C4ED8",
                  fontSize: "13px", fontWeight: 500, color: "white", cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(28,78,216,0.3)",
                }}
              >
                Save Job Opening →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default JobForm;


/* ──────────────────── INTERNAL COMPONENTS ──────────────────── */

const Section = ({ title, subtitle, children, visible }) => {
  if (!visible) return null;
  return (
    <div style={{
      background: "white",
      borderRadius: "16px",
      border: "1px solid #E8E6E0",
      overflow: "hidden",
    }}>
      {/* Section Header */}
      <div style={{
        padding: "20px 28px 18px",
        borderBottom: "1px solid #F0EDE8",
        background: "#FAFAF8",
      }}>
        <div style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#1C1B18", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>{title}</div>
        {subtitle && <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#9B9890" }}>{subtitle}</p>}
      </div>
      {/* Section Body */}
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {children}
      </div>
    </div>
  );
};

const TwoCol = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
    {children}
  </div>
);

const Field = ({ label, required, full, ...props }) => (
  <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
    <label style={{ fontSize: "12px", fontWeight: 600, color: "#4A4845", display: "block", marginBottom: "8px", letterSpacing: "0.02em" }}>
      {label} {required && <span style={{ color: "#DC2626" }}>*</span>}
    </label>
    <input
      {...props}
      style={{
        width: "100%",
        padding: "10px 14px",
        border: "1px solid #E0DDD6",
        borderRadius: "10px",
        fontSize: "14px",
        color: "#1C1B18",
        background: "#FAFAF8",
        outline: "none",
        fontFamily: "inherit",
      }}
      onFocus={e => { e.target.style.borderColor = "#93AEFF"; e.target.style.boxShadow = "0 0 0 3px rgba(99,130,255,0.12)"; e.target.style.background = "white"; }}
      onBlur={e => { e.target.style.borderColor = "#E0DDD6"; e.target.style.boxShadow = "none"; e.target.style.background = "#FAFAF8"; }}
    />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div>
    <label style={{ fontSize: "12px", fontWeight: 600, color: "#4A4845", display: "block", marginBottom: "8px", letterSpacing: "0.02em" }}>
      {label}
    </label>
    <select
      {...props}
      style={{
        width: "100%",
        padding: "10px 14px",
        border: "1px solid #E0DDD6",
        borderRadius: "10px",
        fontSize: "14px",
        color: "#1C1B18",
        background: "#FAFAF8",
        outline: "none",
        fontFamily: "inherit",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239B9890' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
        paddingRight: "36px",
        boxSizing: "border-box",
      }}
      onFocus={e => { e.target.style.borderColor = "#93AEFF"; e.target.style.boxShadow = "0 0 0 3px rgba(99,130,255,0.12)"; }}
      onBlur={e => { e.target.style.borderColor = "#E0DDD6"; e.target.style.boxShadow = "none"; }}
    >
      <option value="">Select status...</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);