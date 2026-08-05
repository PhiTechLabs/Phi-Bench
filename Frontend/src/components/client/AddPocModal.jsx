import React, { useState } from "react";
import { updateClient } from "../../api/clientApi";
import { validateSinglePoc } from "../../utils/clientValidation";
import Card from "../ui/Card";
import FieldRow from "../ui/FieldRow";
import Field from "../ui/Field";
import TInput from "../ui/TInput";

// ─── ADD POC MODAL ─────────────────────────────────────────────────────────
// Standalone "Add a single contact" form, launched from the Client Details
// page — lets you add one more POC to an existing client without opening
// the full Edit Client form. Appends to whatever POCs the client already
// has; doesn't touch any other client field.
//
// clientId      — the client's Mongo _id
// existingPocs  — client.pocs as currently loaded on the details page
// onClose       — called to dismiss without saving
// onAdded(client) — called with the updated client after a successful save
const emptyPoc = {
    firstName: "",
    lastName: "",
    contact: "",
    email: "",
    designation: "",
    linkedin: "",
    location: "",
};

const AddPocModal = ({ clientId, existingPocs = [], onClose, onAdded }) => {
    const [poc, setPoc] = useState(emptyPoc);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPoc((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSave = async () => {
        const pocErrors = validateSinglePoc(poc);
        if (Object.keys(pocErrors).length > 0) {
            setErrors(pocErrors);
            return;
        }

        setSubmitting(true);
        setFormError("");
        try {
            // Strip any frontend-only `id` before sending — existing POCs
            // keep their real `_id` (so they stay the same subdocuments),
            // the new one has none and the backend will assign it.
            const cleanedExisting = existingPocs.map(({ id, ...rest }) => rest);
            const res = await updateClient(clientId, {
                pocs: [...cleanedExisting, poc],
            });
            onAdded(res?.client || res);
        } catch (err) {
            setFormError(
                err?.response?.data?.message || "Failed to add contact. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E8E6E0] bg-white px-5 py-4">
                    <h2 className="text-[15px] font-semibold text-[#1C1B18]">Add Point of Contact</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                    {formError && (
                        <div className="mb-3.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
                            {formError}
                        </div>
                    )}

                    <Card title="Contact Details">
                        <FieldRow>
                            <Field label="First Name" required error={errors.firstName}>
                                <TInput
                                    name="firstName"
                                    value={poc.firstName}
                                    onChange={handleChange}
                                    placeholder="First name"
                                    hasError={!!errors.firstName}
                                />
                            </Field>
                            <Field label="Last Name" required error={errors.lastName}>
                                <TInput
                                    name="lastName"
                                    value={poc.lastName}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                    hasError={!!errors.lastName}
                                />
                            </Field>
                        </FieldRow>

                        <FieldRow>
                            <Field label="Contact">
                                <TInput
                                    name="contact"
                                    value={poc.contact}
                                    onChange={handleChange}
                                    placeholder="Contact number"
                                />
                            </Field>
                            <Field label="Email ID" required error={errors.email}>
                                <TInput
                                    name="email"
                                    value={poc.email}
                                    onChange={handleChange}
                                    placeholder="email@company.com"
                                    hasError={!!errors.email}
                                />
                            </Field>
                        </FieldRow>

                        <FieldRow>
                            <Field label="Designation" required error={errors.designation}>
                                <TInput
                                    name="designation"
                                    value={poc.designation}
                                    onChange={handleChange}
                                    placeholder="e.g. HR Manager"
                                    hasError={!!errors.designation}
                                />
                            </Field>
                            <Field label="LinkedIn" error={errors.linkedin}>
                                <TInput
                                    name="linkedin"
                                    value={poc.linkedin}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/..."
                                    hasError={!!errors.linkedin}
                                />
                            </Field>
                        </FieldRow>

                        <FieldRow single>
                            <Field label="Location" required error={errors.location}>
                                <TInput
                                    name="location"
                                    value={poc.location}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                    hasError={!!errors.location}
                                />
                            </Field>
                        </FieldRow>
                    </Card>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2.5 border-t border-[#E8E6E0] px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-lg border border-[#E0DDD6] bg-white px-4 py-2 text-[13px] font-medium text-[#4A4845] hover:bg-[#F5F4F0] disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={submitting}
                        className="rounded-lg bg-[#1C4ED8] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1741B6] disabled:opacity-50"
                    >
                        {submitting ? "Saving..." : "Add Contact"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddPocModal;