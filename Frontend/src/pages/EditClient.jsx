import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useClientForm from "../hooks/useClientForm";
import { validateClientForm } from "../utils/clientValidation";
import { getClientById, updateClient } from "../api/clientApi";
import { parseApiError } from "../utils/apiError";

import FormHeader from "../components/shared/FormHeader";
import ClientInfoSection from "../components/client/ClientInfoSection";
import LocationList from "../components/client/LocationList";
import PocList from "../components/client/PocList";
import AttachmentSection from "../components/shared/AttachmentSection";
import ErrorModal from "../components/shared/ErrorModal";
import Btn from "../components/ui/Btn";
import useRoleBase from "../hooks/useRoleBase";

const EditClient = () => {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const roleBase   = useRoleBase();

    const [loading,     setLoading]     = useState(true);
    const [fetchError,  setFetchError]  = useState("");
    const [clientCode,  setClientCode]  = useState(null);
    const [submitting,  setSubmitting]  = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [formError,   setFormError]   = useState(null);

    // Hook always called unconditionally — starts empty, seeded via seedForm()
    const form = useClientForm();

    // ─── FETCH + SEED ─────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await getClientById(id);
                const client = res?.client || res;
                if (!cancelled && client) {
                    setClientCode(client.code || null);
                    form.seedForm(client);   // populate all form fields at once
                }
            } catch (err) {
                console.error("EditClient fetch error:", err);
                if (!cancelled) setFetchError("Failed to load client.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ─── SCROLL TO FIRST ERROR ────────────────────────────────────────────────
    const CLIENT_REQUIRED_FIELDS = ["clientName", "contactNumber", "industry"];
    const fieldRefs = useRef(
        Object.fromEntries(CLIENT_REQUIRED_FIELDS.map((k) => [k, React.createRef()]))
    );
    useEffect(() => {
        if (!Object.keys(fieldErrors).length) return;
        for (const key of CLIENT_REQUIRED_FIELDS) {
            if (fieldErrors[key] && fieldRefs.current[key]?.current) {
                fieldRefs.current[key].current.scrollIntoView({ behavior: "smooth", block: "center" });
                break;
            }
        }
    }, [fieldErrors]);

    const handleChange = (e) => {
        form.handleChange(e);
        const { name } = e.target;
        if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: undefined }));
    };

    // ─── SUBMIT ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        const { valid, errors } = validateClientForm({ formData: form.formData, pocs: form.pocs });
        if (!valid) { setFieldErrors(errors); return; }
        try {
            setSubmitting(true);
            const { documents: _d, ...rest } = form.buildPayload();
            await updateClient(id, rest);
            navigate(`${roleBase}/client-list/${id}`);
        } catch (err) {
            setFormError(parseApiError(err, "Failed to update client"));
        } finally {
            setSubmitting(false);
        }
    };

    // ─── LOADING / ERROR ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0]">
                <p className="text-[13px] text-[#9B9890]">Loading client…</p>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0]">
                <div className="text-center">
                    <p className="text-[14px] font-semibold text-[#B91C1C]">{fetchError}</p>
                    <button onClick={() => navigate(-1)}
                        className="mt-4 rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] text-[#475569] hover:bg-[#F8FAFC]">
                        ← Go back
                    </button>
                </div>
            </div>
        );
    }

    // ─── FORM ─────────────────────────────────────────────────────────────────
    return (
        <>
        <div className="min-h-screen font-sans" style={{ backgroundColor: "#f7f5f2" }}>
            <FormHeader
                title="Edit Client"
                badge={clientCode}
                onCancel={() => navigate(-1)}
                onSave={handleSubmit}
                submitting={submitting}
            />
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-6 space-y-4">
                <ClientInfoSection
                    formData={form.formData}
                    handleChange={handleChange}
                    errors={fieldErrors}
                    fieldRefs={fieldRefs.current}
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
                <div className="flex justify-end gap-3 pb-10">
                    <Btn onClick={() => navigate(-1)} variant="ghost" disabled={submitting}>Cancel</Btn>
                    <Btn onClick={handleSubmit} variant="primary" disabled={submitting}>
                        {submitting ? "Saving…" : "Save Changes"}
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

export default EditClient;