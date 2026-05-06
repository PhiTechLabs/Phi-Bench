    import React, { useState } from "react";
    import { useNavigate } from "react-router-dom";

    /* ─── default shapes ─── */
    const defaultLocation = () => ({
    id: Date.now() + Math.random(),
    street: "",
    city: "",
    province: "",
    code: "",
    country: "",
    });

    const defaultPOC = () => ({
    id: Date.now() + Math.random(),
    firstName: "",
    lastName: "",
    contact: "",
    email: "",
    designation: "",
    linkedin: "",
    location: "",
    });

    const AddClient = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        clientName: "",
        parentClient: "",
        countryCode: "us +1",
        contactNumber: "",
        website: "",
        accountManager: "",
        linkedin: "",
        industry: "",
        about: "",
        source: "",
    });

    const [locations, setLocations] = useState([defaultLocation()]);
    const [documents, setDocuments] = useState([]);
    const [pocs, setPocs] = useState([]);
    const [showPocSection, setShowPocSection] = useState(false);

    /* ── client info change ── */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /* ── location handlers ── */
    const handleLocationChange = (id, e) => {
        const { name, value } = e.target;
        setLocations((prev) =>
        prev.map((loc) => (loc.id === id ? { ...loc, [name]: value } : loc))
        );
    };
    const addLocation = () => setLocations((prev) => [...prev, defaultLocation()]);
    const removeLocation = (id) =>
        setLocations((prev) => prev.filter((loc) => loc.id !== id));

    /* ── document handlers ── */
    const handleAddDocument = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setDocuments((prev) => [
        ...prev,
        { id: Date.now(), file, name: file.name },
        ]);
        e.target.value = "";
    };
    const removeDocument = (id) =>
        setDocuments((prev) => prev.filter((d) => d.id !== id));

    /* ── POC handlers ── */
    const handleAddPoc = () => {
        setShowPocSection(true);
        setPocs((prev) => [...prev, defaultPOC()]);
    };
    const handlePocChange = (id, e) => {
        const { name, value } = e.target;
        setPocs((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [name]: value } : p))
        );
    };
    const removePoc = (id) => {
        const updated = pocs.filter((p) => p.id !== id);
        setPocs(updated);
        if (updated.length === 0) setShowPocSection(false);
    };

    /* ── submit ── */
    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: await axios.post('/api/clients', { ...formData, locations, documents, pocs })
        console.log("Submit:", { formData, locations, documents, pocs });
    };

    const handleCancel = () => navigate(-1);

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: "#f7f5f2" }}>

        {/* ── TOP BAR ── */}
        <div
            className="sticky top-0 z-10 px-8 py-3 flex items-center justify-between border-b"
            style={{ backgroundColor: "#ffffff", borderColor: "#e5e1db" }}
        >
            <h1 className="text-sm font-semibold text-gray-700 tracking-tight">
            Create Client
            </h1>
            <div className="flex items-center gap-2">
            <Btn onClick={handleCancel} variant="ghost">Cancel</Btn>
            <Btn onClick={handleSubmit} variant="primary">Save</Btn>
            </div>
        </div>

        {/* ── BODY ── */}
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-6 py-8 space-y-6">

            {/* ════ CLIENT INFORMATION ════ */}
            <Card title="Client Information">

            <FieldRow>
                <Field label="Client Name" required>
                <TInput name="clientName" value={formData.clientName} onChange={handleChange} placeholder="Enter client name" />
                </Field>
                <Field label="Parent Client">
                <TInput name="parentClient" value={formData.parentClient} onChange={handleChange} placeholder="Search parent client" />
                </Field>
            </FieldRow>

            <FieldRow>
                <Field label="Contact Number" required>
                <div className="flex gap-2">
                    {/* <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="shrink-0 rounded-xl border px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    style={{ borderColor: "#d1cdc7", width: "90px" }}
                    >
                    <option value="us +1">us +1</option>
                    <option value="in +91">in +91</option>
                    <option value="uk +44">uk +44</option>
                    </select> */}
                    <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Contact number"
                    required
                    className="flex-1 rounded-xl border px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ borderColor: "#d1cdc7" }}
                    />
                </div>
                </Field>
                <Field label="Website" required>
                <TInput name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com" required />
                </Field>
            </FieldRow>

            <FieldRow>
                <Field label="Account Manager">
                <SInput name="accountManager" value={formData.accountManager} onChange={handleChange} placeholder="Select manager"
                    options={["karan.singh", "amit.kumar", "priya.sharma"]} />
                </Field>
                <Field label="LinkedIn">
                <TInput name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/company/..." />
                </Field>
            </FieldRow>

            <FieldRow>
                <Field label="Industry">
                <SInput name="industry" value={formData.industry} onChange={handleChange} placeholder="Select industry"
                    options={["Technology", "Healthcare", "Finance", "Retail", "Manufacturing", "Education", "Other"]} />
                </Field>
                <Field label="Source">
                <SInput name="source" value={formData.source} onChange={handleChange} placeholder="Select source"
                    options={["Added by User", "Referral", "Website", "Cold Outreach", "Social Media"]} />
                </Field>
            </FieldRow>

            <FieldRow single>
                <Field label="About">
                <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    placeholder="Brief description about the client..."
                    rows={3}
                    className="w-full rounded-xl border px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ borderColor: "#d1cdc7" }}
                />
                </Field>
            </FieldRow>

            </Card>

            {/* ════ LOCATION CARDS ════ */}
            {locations.map((loc, idx) => (
            <Card
                key={loc.id}
                title={idx === 0 ? "Address Information" : `Address Information ${idx + 1}`}
                onRemove={idx > 0 ? () => removeLocation(loc.id) : null}
            >
                <FieldRow>
                <Field label="Street">
                    <TInput name="street" value={loc.street} onChange={(e) => handleLocationChange(loc.id, e)} placeholder="Street address" />
                </Field>
                <Field label="City">
                    <TInput name="city" value={loc.city} onChange={(e) => handleLocationChange(loc.id, e)} placeholder="City" />
                </Field>
                </FieldRow>
                <FieldRow>
                <Field label="Province">
                    <TInput name="province" value={loc.province} onChange={(e) => handleLocationChange(loc.id, e)} placeholder="Province / State" />
                </Field>
                <Field label="Postal Code">
                    <TInput name="code" value={loc.code} onChange={(e) => handleLocationChange(loc.id, e)} placeholder="Postal / ZIP code" />
                </Field>
                </FieldRow>
                <FieldRow single>
                <Field label="Country">
                    <TInput name="country" value={loc.country} onChange={(e) => handleLocationChange(loc.id, e)} placeholder="Country" />
                </Field>
                </FieldRow>
            </Card>
            ))}

            {/* Add Location button */}
            <div>
            <button
                type="button"
                onClick={addLocation}
                className="flex items-center gap-2 text-sm font-medium text-blue-700 border border-blue-200 rounded-xl px-4 py-2 bg-white hover:bg-blue-50 transition-all duration-150"
            >
                <span className="text-lg leading-none">+</span> Add Location
            </button>
            </div>

            {/* ════ ADD POC BUTTON ════ */}
            {!showPocSection && (
            <div>
                <button
                type="button"
                onClick={handleAddPoc}
                className="flex items-center gap-2 text-sm font-medium text-blue-700 border border-blue-200 rounded-xl px-4 py-2 bg-white hover:bg-blue-50 transition-all duration-150"
                >
                <span className="text-lg leading-none">+</span> Add POC
                </button>
            </div>
            )}

            {/* ════ POC CARDS ════ */}
            {showPocSection && (
            <div className="space-y-6">
                {pocs.map((poc, idx) => (
                <Card
                    key={poc.id}
                    title={`Point of Contact ${pocs.length > 1 ? idx + 1 : ""}`}
                    onRemove={() => removePoc(poc.id)}
                >
                    <FieldRow>
                    <Field label="First Name" required>
                        <TInput name="firstName" value={poc.firstName} onChange={(e) => handlePocChange(poc.id, e)} placeholder="First name" required />
                    </Field>
                    <Field label="Last Name" required>
                        <TInput name="lastName" value={poc.lastName} onChange={(e) => handlePocChange(poc.id, e)} placeholder="Last name" required />
                    </Field>
                    </FieldRow>

                    <FieldRow>
                    <Field label="Contact">
                        <TInput name="contact" value={poc.contact} onChange={(e) => handlePocChange(poc.id, e)} placeholder="Contact number" />
                    </Field>
                    <Field label="Email ID" required>
                        <TInput name="email" value={poc.email} onChange={(e) => handlePocChange(poc.id, e)} placeholder="email@company.com" required />
                    </Field>
                    </FieldRow>

                    <FieldRow>
                    <Field label="Designation" required>
                        <TInput name="designation" value={poc.designation} onChange={(e) => handlePocChange(poc.id, e)} placeholder="e.g. HR Manager" required />
                    </Field>
                    <Field label="LinkedIn">
                        <TInput name="linkedin" value={poc.linkedin} onChange={(e) => handlePocChange(poc.id, e)} placeholder="https://linkedin.com/in/..." />
                    </Field>
                    </FieldRow>

                    <FieldRow single>
                    <Field label="Location" required>
                        <TInput name="location" value={poc.location} onChange={(e) => handlePocChange(poc.id, e)} placeholder="City, Country" required />
                    </Field>
                    </FieldRow>
                </Card>
                ))}

                {/* Add another POC */}
                <button
                type="button"
                onClick={() => setPocs((prev) => [...prev, defaultPOC()])}
                className="flex items-center gap-2 text-sm font-medium text-blue-700 border border-blue-200 rounded-xl px-4 py-2 bg-white hover:bg-blue-50 transition-all duration-150"
                >
                <span className="text-lg leading-none">+</span> Add POC
                </button>
            </div>
            )}


            {/* ════ ATTACHMENT CARD ════ */}
            <Card title="Attachment Information">
            <div className="space-y-3">
                {/* Uploaded docs list */}
                {documents.length > 0 && (
                <ul className="space-y-2">
                    {documents.map((doc) => (
                    <li
                        key={doc.id}
                        className="flex items-center justify-between rounded-xl border px-4 py-2.5"
                        style={{ borderColor: "#d1cdc7", backgroundColor: "#faf9f7" }}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                        <DocIcon />
                        <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                        </div>
                        <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-3 shrink-0 text-lg leading-none"
                        >
                        ×
                        </button>
                    </li>
                    ))}
                </ul>
                )}

                {/* Add Document button */}
                <label className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 border border-blue-200 rounded-xl px-4 py-2 bg-white hover:bg-blue-50 transition-all duration-150 cursor-pointer">
                <span className="text-lg leading-none">+</span> Add Document
                <input type="file" className="hidden" onChange={handleAddDocument} />
                </label>
            </div>
            </Card>

            
            {/* ── BOTTOM ACTIONS ── */}
            <div className="flex justify-end gap-3 pb-10">
            <Btn onClick={handleCancel} variant="ghost">Cancel</Btn>
            <Btn onClick={handleSubmit} variant="primary">Save Client</Btn>
            </div>

        </form>
        </div>
    );
    };

    /* ═══════════════════════════════════
    LAYOUT COMPONENTS
    ═══════════════════════════════════ */

    const Card = ({ title, children, onRemove }) => (
    <div
        className="rounded-2xl px-8 pt-6 pb-8 space-y-5"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e5e1db" }}
    >
        <div className="flex items-center gap-4 mb-2">
        <h2 className="text-sm font-semibold text-gray-700 whitespace-nowrap">{title}</h2>
        <div className="flex-1 h-px" style={{ backgroundColor: "#e5e1db" }} />
        {onRemove && (
            <button
            type="button"
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none ml-2 shrink-0"
            title="Remove"
            >
            ×
            </button>
        )}
        </div>
        {children}
    </div>
    );

    const FieldRow = ({ children, single }) => (
    <div className={`grid gap-x-8 gap-y-5 ${single ? "grid-cols-1" : "grid-cols-2"}`}>
        {children}
    </div>
    );

    const Field = ({ label, required, children }) => (
    <div className="flex items-start gap-3">
        <label
        className="text-sm text-gray-500 pt-2.5 text-right leading-tight shrink-0"
        style={{ minWidth: "118px" }}
        >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="flex-1">{children}</div>
    </div>
    );

    /* ═══════════════════════════════════
    INPUT COMPONENTS
    ═══════════════════════════════════ */

    const TInput = ({ required, ...props }) => (
    <input
        type="text"
        required={required}
        {...props}
        className="w-full rounded-xl border px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
        style={{ borderColor: "#d1cdc7" }}
    />
    );

    const SInput = ({ options, placeholder, ...props }) => (
    <select
        {...props}
        className="w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
        style={{
        borderColor: "#d1cdc7",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        }}
    >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
        ))}
    </select>
    );

    const Btn = ({ children, onClick, variant }) => (
    <button
        type="button"
        onClick={onClick}
        className="px-4 py-1.5 text-sm rounded-lg transition-all duration-150 active:scale-95"
        style={
        variant === "primary"
            ? { backgroundColor: "#1d4ed8", color: "#fff", border: "none" }
            : { backgroundColor: "transparent", color: "#6b7280", border: "1px solid #d1cdc7" }
        }
        onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor =
            variant === "primary" ? "#1e40af" : "#f5f3f0";
        }}
        onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor =
            variant === "primary" ? "#1d4ed8" : "transparent";
        }}
    >
        {children}
    </button>
    );

    const DocIcon = () => (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 0C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H12C13.1 16 14 15.1 14 14V5L9 0H2ZM8 1.5L12.5 6H8V1.5ZM3 8H11V9.5H3V8ZM3 11H9V12.5H3V11Z" fill="#9ca3af"/>
    </svg>
    );

    export default AddClient;