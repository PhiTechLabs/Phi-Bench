import React from "react";
import Card from "../ui/Card";
import FieldRow from "../ui/FieldRow";
import Field from "../ui/Field";
import TInput from "../ui/TInput";
import SInput from "../ui/SInput";

// ─── DROPDOWN OPTIONS ─────────────────────────────────────────────────────────
const INDUSTRIES = ["Technology", "Healthcare", "Finance", "Retail", "Manufacturing", "Education", "Other"];
const SOURCES = ["Added by User", "Referral", "Website", "Cold Outreach", "Social Media"];

// ─── CLIENT INFO SECTION ──────────────────────────────────────────────────────
// Top "Client Information" card — name, contact, website, dropdowns, about.
const ClientInfoSection = ({ formData, handleChange }) => (
    <Card title="Client Information">
        <FieldRow>
            <Field label="Client Name" required>
                <TInput
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="Enter client name"
                />
            </Field>
            <Field label="Parent Client">
                <TInput
                    name="parentClient"
                    value={formData.parentClient}
                    onChange={handleChange}
                    placeholder="Enter parent client name"
                />
            </Field>
        </FieldRow>

        <FieldRow>
            <Field label="Contact Number" required>
                <TInput
                    name="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Contact number"
                    required
                />
            </Field>
            <Field label="Website" required>
                <TInput
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    required
                />
            </Field>
        </FieldRow>

        <FieldRow>
            <Field label="Account Manager">
                <TInput
                    name="accountManager"
                    value={formData.accountManager}
                    onChange={handleChange}
                    placeholder="Enter account manager name"
                />
            </Field>
            <Field label="LinkedIn">
                <TInput
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/company/..."
                />
            </Field>
        </FieldRow>

        <FieldRow>
            <Field label="Industry">
                <SInput
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Select industry"
                    options={INDUSTRIES}
                />
            </Field>
            <Field label="Source">
                <SInput
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    placeholder="Select source"
                    options={SOURCES}
                />
            </Field>
        </FieldRow>

        <FieldRow single>
            <Field label="About">
                <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    placeholder="Brief description about the client..."
                    rows={2}
                    className="w-full rounded-lg border px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ borderColor: "#d1cdc7" }}
                />
            </Field>
        </FieldRow>
    </Card>
);

export default ClientInfoSection;