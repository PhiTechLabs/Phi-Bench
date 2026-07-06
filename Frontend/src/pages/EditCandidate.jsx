import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getCandidate, updateCandidate } from "../api/candidatesApi";
import { parseApiError } from "../utils/apiError";
import CandidateForm from "./CandidateForm";
import ErrorModal from "../components/shared/ErrorModal";
import useRoleBase from "../hooks/useRoleBase";

// ─── EDIT CANDIDATE PAGE ──────────────────────────────────────────────────────
// Thin loader wrapper: fetches the existing candidate, then renders the
// shared CandidateForm in edit mode (initialData + isEdit=true).
// CandidateForm seeds its own state from initialData on mount and calls
// onSave which we intercept here to call updateCandidate instead of createCandidate.

const EditCandidate = () => {
    const { id }   = useParams();
    const navigate = useNavigate();
    const roleBase = useRoleBase();

    const [state,     setState]     = useState({ loading: true, candidate: null, error: "" });
    const [formError, setFormError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const candidate = await getCandidate(id);
                if (!cancelled) {
                    if (!candidate) {
                        setState({ loading: false, candidate: null, error: "Candidate not found." });
                    } else {
                        setState({ loading: false, candidate, error: "" });
                    }
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) setState({ loading: false, candidate: null, error: "Failed to load candidate." });
            }
        })();
        return () => { cancelled = true; };
    }, [id]);

    // Called by CandidateForm when the user clicks Save.
    // We call updateCandidate here instead of createCandidate.
    const handleSave = async (payload) => {
        try {
            await updateCandidate(id, payload);
            navigate(`${roleBase}/candidates/${id}`);
        } catch (err) {
            // Re-throw so CandidateForm's own catch shows the ErrorModal
            throw err;
        }
    };

    if (state.loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0]">
                <p className="text-[13px] text-[#9B9890]">Loading candidate…</p>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0]">
                <div className="text-center">
                    <p className="text-[14px] font-semibold text-[#B91C1C]">{state.error}</p>
                    <button onClick={() => navigate(-1)}
                        className="mt-4 rounded-lg border border-[#E2E8F0] px-4 py-2 text-[13px] text-[#475569] hover:bg-[#F8FAFC]">
                        ← Go back
                    </button>
                </div>
            </div>
        );
    }

    // CandidateForm renders with:
    //   setShowForm → navigate back to candidate detail
    //   onSave      → calls updateCandidate
    //   initialData → seeds all form fields, education, experience
    //   isEdit      → shows "Edit Candidate" title, "Save Changes" button, no code preview
    return (
        <>
        <CandidateForm
            setShowForm={() => navigate(-1)}
            onSave={handleSave}
            initialData={state.candidate}
            isEdit
        />
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

export default EditCandidate;