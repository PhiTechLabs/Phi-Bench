import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getJobById, updateJob } from "../api/jobsApi";
import JobForm from "./JobForm";
import useRoleBase from "../hooks/useRoleBase";

// ─── EDIT JOB PAGE ────────────────────────────────────────────────────────────
// Thin loader: fetches the existing job, then renders the shared JobForm
// in edit mode (initialData + isEdit=true).
// JobForm seeds its own state from initialData on mount and calls onSave
// which we intercept here to call updateJob instead of createJob.

const EditJob = () => {
    const { id }   = useParams();
    const navigate = useNavigate();
    const roleBase = useRoleBase();

    const [state, setState] = useState({ loading: true, job: null, error: "" });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const job = await getJobById(id);
                const resolved = job?.job || job;
                if (!cancelled) {
                    if (!resolved) {
                        setState({ loading: false, job: null, error: "Job not found." });
                    } else {
                        setState({ loading: false, job: resolved, error: "" });
                    }
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) setState({ loading: false, job: null, error: "Failed to load job." });
            }
        })();
        return () => { cancelled = true; };
    }, [id]);

    const handleSave = async (payload) => {
        await updateJob(id, payload);
        navigate(`${roleBase}/jobs/${id}`);
    };

    if (state.loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0]">
                <p className="text-[13px] text-[#9B9890]">Loading job…</p>
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

    return (
        <JobForm
            setShowForm={() => navigate(-1)}
            onSave={handleSave}
            initialData={state.job}
            isEdit
        />
    );
};

export default EditJob;