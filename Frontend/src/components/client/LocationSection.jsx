import React from "react";
import Card from "../ui/Card";
import FieldRow from "../ui/FieldRow";
import Field from "../ui/Field";
import TInput from "../ui/TInput";

// ─── SINGLE LOCATION CARD ─────────────────────────────────────────────────────
// Renders ONE location card. The list manager (LocationList) handles the array.
const LocationSection = ({ location, index, onChange, onRemove }) => {
    const handleFieldChange = (e) => onChange(location.id, e);

    return (
        <Card
            title={index === 0 ? "Address Information" : `Address Information ${index + 1}`}
            onRemove={index > 0 ? () => onRemove(location.id) : null}
        >
            <FieldRow>
                <Field label="Street">
                    <TInput name="street" value={location.street} onChange={handleFieldChange} placeholder="Street address" />
                </Field>
                <Field label="City">
                    <TInput name="city" value={location.city} onChange={handleFieldChange} placeholder="City" />
                </Field>
            </FieldRow>
            <FieldRow>
                <Field label="Province">
                    <TInput name="province" value={location.province} onChange={handleFieldChange} placeholder="Province / State" />
                </Field>
                <Field label="Postal Code">
                    <TInput name="code" value={location.code} onChange={handleFieldChange} placeholder="Postal / ZIP code" />
                </Field>
            </FieldRow>
            <FieldRow single>
                <Field label="Country">
                    <TInput name="country" value={location.country} onChange={handleFieldChange} placeholder="Country" />
                </Field>
            </FieldRow>
        </Card>
    );
};

export default LocationSection;