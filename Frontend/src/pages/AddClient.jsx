import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import useClientForm from "../hooks/useClientForm";
import { validateClientForm } from "../utils/clientValidation";
import { createClient } from "../api/clientApi";

import FormHeader from "../components/shared/FormHeader";
import ClientInfoSection from "../components/client/ClientInfoSection";
import LocationList from "../components/client/LocationList";
import PocList from "../components/client/PocList";
import AttachmentSection from "../components/shared/AttachmentSection";
import Btn from "../components/ui/Btn";
import useRoleBase from "../hooks/useRoleBase.";



// ─── ADD CLIENT PAGE ──────────────────────────────────────────────────────────
const AddClient = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const roleBase = useRoleBase();

    // ALL form state + handlers come from the hook
    const form = useClientForm();
    // ─── SUBMIT HANDLER ───────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();

        // 1. Frontend validation (fast feedback)
        const { valid, errors } = validateClientForm({
            formData: form.formData,
            pocs: form.pocs,
        });
        if (!valid) {
            const firstError = Object.values(errors)[0];
            alert(firstError); // simple for now — can upgrade to toast/inline later
            return;
        }

        // 2. Submit to backend
        try {
            setSubmitting(true);
            const payload = form.buildPayload();
            const response = await createClient(payload);

            alert("Client created successfully!");
            form.resetForm();
            navigate(`${roleBase}/client-list`); // adjust to wherever your client list lives
        } catch (error) {
            // Backend validation errors come back with { message, errors: [...] }
            const serverMsg =
                error.response?.data?.errors?.[0]?.message ||
                error.response?.data?.message ||
                error.message ||
                "Something went wrong";
            alert(`Error: ${serverMsg}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => navigate(-1);

    // ─── RENDER ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: "#f7f5f2" }}>
            <FormHeader
                title="Create Client"
                onCancel={handleCancel}
                onSave={handleSubmit}
                submitting={submitting}
            />

            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-6 py-8 space-y-6">
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
    );
};

export default AddClient;