import React from "react";
import Card from "../ui/Card";
import FieldRow from "../ui/FieldRow";
import Field from "../ui/Field";
import TInput from "../ui/TInput";

// ─── SINGLE POC CARD ──────────────────────────────────────────────────────────
const PocSection = ({ poc, index, totalCount, onChange, onRemove }) => {
    const handleFieldChange = (e) => onChange(poc.id, e);
    const titleSuffix = totalCount > 1 ? ` ${index + 1}` : "";

    return (
        <Card
            title={`Point of Contact${titleSuffix}`}
            onRemove={() => onRemove(poc.id)}
        >
            <FieldRow>
                <Field label="First Name" required>
                    <TInput name="firstName" value={poc.firstName} onChange={handleFieldChange} placeholder="First name" required />
                </Field>
                <Field label="Last Name" required>
                    <TInput name="lastName" value={poc.lastName} onChange={handleFieldChange} placeholder="Last name" required />
                </Field>
            </FieldRow>

            <FieldRow>
                <Field label="Contact">
                    <TInput name="contact" value={poc.contact} onChange={handleFieldChange} placeholder="Contact number" />
                </Field>
                <Field label="Email ID" required>
                    <TInput name="email" value={poc.email} onChange={handleFieldChange} placeholder="email@company.com" required />
                </Field>
            </FieldRow>

            <FieldRow>
                <Field label="Designation" required>
                    <TInput name="designation" value={poc.designation} onChange={handleFieldChange} placeholder="e.g. HR Manager" required />
                </Field>
                <Field label="LinkedIn">
                    <TInput name="linkedin" value={poc.linkedin} onChange={handleFieldChange} placeholder="https://linkedin.com/in/..." />
                </Field>
            </FieldRow>

            <FieldRow single>
                <Field label="Location" required>
                    <TInput name="location" value={poc.location} onChange={handleFieldChange} placeholder="City, Country" required />
                </Field>
            </FieldRow>
        </Card>
    );
};

export default PocSection;