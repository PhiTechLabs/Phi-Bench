import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import useClientForm from "../hooks/useClientForm";
import { validateClientForm } from "../utils/clientValidation";
import { createClient } from "../api/clientApi";
import { getNextCodePreview } from "../api/codePreviewApi";
import { parseApiError } from "../utils/apiError";

import FormHeader from "../components/shared/FormHeader";
import ClientInfoSection from "../components/client/ClientInfoSection";
import LocationList from "../components/client/LocationList";
import PocList from "../components/client/PocList";
import AttachmentSection from "../components/shared/AttachmentSection";
import ErrorModal from "../components/shared/ErrorModal";
import Btn from "../components/ui/Btn";
import useRoleBase from "../hooks/useRoleBase";



// ─── ADD CLIENT PAGE ──────────────────────────────────────────────────────────
const AddClient = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    const roleBase = useRoleBase();

    // ALL form state + handlers come from the hook
    const form = useClientForm();

    // ─── NEXT CODE PREVIEW ─────────────────────────────────────────────────────
    // Read-only preview of the code this client will be assigned (e.g.
    // "CL014"). The real code is only actually assigned by the backend at
    // save time — this is purely informational.
    const [nextCode, setNextCode] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const code = await getNextCodePreview("client");
                setNextCode(code);
            } catch (err) {
                console.warn("Failed to preview next client code:", err?.response?.data || err);
            }
        })();
    }, []);
    // ─── SUBMIT HANDLER ───────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();

        // 1. Frontend validation (fast feedback)
        const { valid, errors } = validateClientForm({
            formData: form.formData,
            pocs: form.pocs,
        });
        if (!valid) {
            const errorMessages = Object.values(errors).filter(Boolean);
            setFormError({
                title: "Please fix the following",
                message: errorMessages[0] || "Some required fields are missing.",
                errors: errorMessages.map((m) => ({ message: m })),
            });
            return;
        }

        // 2. Submit to backend
        try {
            setSubmitting(true);
            const payload = form.buildPayload();
            await createClient(payload);

            form.resetForm();
            navigate(`${roleBase}/client-list`);
        } catch (error) {
            setFormError(parseApiError(error, "Failed to create client"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => navigate(-1);

    // ─── RENDER ───────────────────────────────────────────────────────────────
    return (
        <>
        <div className="min-h-screen font-sans" style={{ backgroundColor: "#f7f5f2" }}>
            <FormHeader
                title="Create Client"
                badge={nextCode ? `Next code: ${nextCode}` : null}
                onCancel={handleCancel}
                onSave={handleSubmit}
                submitting={submitting}
                
            />

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-6 space-y-4">
                <ClientInfoSection
                    formData={form.formData}
                    handleChange={form.handleChange}
                />

                <LocationList
                    locations={form.locations}
                    onLocationChange={form.handleLocationChange}
                    onAdd={form.addLocation}
                    onRemove={form.removeLocation}
                />

                <PocList
                    pocs={form.pocs}
                    showPocSection={form.showPocSection}
                    onPocChange={form.handlePocChange}
                    onShowAndAddFirst={form.showPocAndAddFirst}
                    onAdd={form.addPoc}
                    onRemove={form.removePoc}
                />

                <AttachmentSection
                    documents={form.documents}
                    onAddDocument={form.handleAddDocument}
                    onRemoveDocument={form.removeDocument}
                />

                {/* Bottom action buttons */}
                <div className="flex justify-end gap-3 pb-10">
                    <Btn onClick={handleCancel} variant="ghost" disabled={submitting}>
                        Cancel
                    </Btn>
                    <Btn onClick={handleSubmit} variant="primary" disabled={submitting}>
                        {submitting ? "Saving..." : "Save Client"}
                    </Btn>
                </div>
            </form>
        </div>

        {formError && (
            <ErrorModal
                title={formError.title}
                message={formError.message}
                errors={formError.errors}
                onClose={() => setFormError(null)}
            />
        )}
        </>
    );
};

export default AddClient;