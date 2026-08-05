import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../api/axiosInstance";
import Card from "../ui/Card";
import FieldRow from "../ui/FieldRow";
import Field from "../ui/Field";
import TInput from "../ui/TInput";
import SInput from "../ui/SInput";

// ─── DROPDOWN OPTIONS ─────────────────────────────────────────────────────────
const INDUSTRIES = ["Technology", "Healthcare", "Finance", "Retail", "Manufacturing", "Education", "Other"];
const SOURCES = ["Added by User", "Referral", "Website", "Cold Outreach", "Social Media"];

// ─── CLIENT INFO SECTION ──────────────────────────────────────────────────────
// errors     — { fieldName: "error message" } for inline red error display
// fieldRefs  — { fieldName: React.createRef() } for auto-scroll to first error
const ClientInfoSection = ({ formData, handleChange, errors = {}, fieldRefs = {} }) => {
    // ─── ACCOUNT MANAGER — USER PICKER ────────────────────────────────────────
    // Same pattern as JobForm's UserSelect: fetch all system users via the
    // picker endpoint, let the user search/select instead of free-typing.
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await axiosInstance.get("/auth/users/picker");
                const list = res.data?.users || [];
                setUsers(
                    list.map((u) => ({
                        id: u.id,
                        username: u.username,
                        role: u.role || "",
                    }))
                );
            } catch (err) {
                console.warn("Failed to load users:", err?.response?.data || err);
            } finally {
                setUsersLoading(false);
            }
        })();
    }, []);

    const handleAccountManagerSelect = (username) => {
        handleChange({ target: { name: "accountManager", value: username } });
    };
    const handleAccountManagerClear = () => {
        handleChange({ target: { name: "accountManager", value: "" } });
    };

    return (
        <Card title="Client Information">
            <FieldRow>
                <Field label="Client Name" required error={errors.clientName} wrapperRef={fieldRefs.clientName}>
                    <TInput
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleChange}
                        placeholder="Enter client name"
                        hasError={!!errors.clientName}
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
                <Field label="Contact Number" required error={errors.contactNumber} wrapperRef={fieldRefs.contactNumber}>
                    <TInput
                        name="contactNumber"
                        type="tel"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="Contact number"
                        hasError={!!errors.contactNumber}
                    />
                </Field>
                <Field label="Website" error={errors.website}>
                    <TInput
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        hasError={!!errors.website}
                    />
                </Field>
            </FieldRow>

            <FieldRow>
                <Field label="Account Manager">
                    <UserSelect
                        users={users}
                        loading={usersLoading}
                        value={formData.accountManager}
                        onSelect={handleAccountManagerSelect}
                        onClear={handleAccountManagerClear}
                    />
                </Field>
                <Field label="LinkedIn" error={errors.linkedin}>
                    <TInput
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/company/..."
                        hasError={!!errors.linkedin}
                    />
                </Field>
            </FieldRow>

            <FieldRow>
                <Field label="Industry" required error={errors.industry} wrapperRef={fieldRefs.industry}>
                    <SInput
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        placeholder="Select industry"
                        options={INDUSTRIES}
                        hasError={!!errors.industry}
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
};

export default ClientInfoSection;

/* ──────────────────── INTERNAL COMPONENTS ──────────────────── */

const inputBorderStyle = { borderColor: "#d1cdc7" };

// ─── USER SELECT ──────────────────────────────────────────────────────────────
// Searchable combobox listing ALL system users (any role). Same interaction
// model as the Account Manager / Assign Recruiter pickers in JobForm.jsx —
// type to filter, click to confirm, ✕ to clear.
const UserSelect = ({ users = [], loading, value, onSelect, onClear }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const boxRef = useRef(null);

    useEffect(() => {
        const h = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const filtered = users.filter(
        (u) =>
            u.username.toLowerCase().includes(query.trim().toLowerCase()) ||
            u.role.toLowerCase().includes(query.trim().toLowerCase())
    );

    const inputValue = open ? query : (value || "");

    return (
        <div className="relative flex min-w-0 flex-1 flex-col" ref={boxRef}>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => {
                    setQuery("");
                    setOpen(true);
                }}
                placeholder={loading ? "Loading users…" : "Search account manager…"}
                disabled={loading}
                autoComplete="off"
                style={inputBorderStyle}
                className={`w-full rounded-lg border px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 bg-white outline-none transition-all duration-150 focus:ring-2 focus:border-blue-500 focus:ring-blue-500 ${
                    loading ? "cursor-not-allowed opacity-60" : ""
                }`}
            />

            {/* Clear button */}
            {value && (
                <button
                    type="button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        onClear();
                        setQuery("");
                        setOpen(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9B9890] hover:text-[#DC2626] text-[11px]"
                >
                    ✕
                </button>
            )}

            {open && !loading && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-20 max-h-52 overflow-y-auto rounded-lg border border-[#d1cdc7] bg-white py-1 shadow-lg">
                    {filtered.length === 0 ? (
                        <div className="px-3 py-2 text-[12.5px] text-gray-400">
                            {users.length === 0 ? "No users found." : "No users match your search."}
                        </div>
                    ) : (
                        filtered.map((u) => (
                            <button
                                key={u.id}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    onSelect(u.username);
                                    setQuery("");
                                    setOpen(false);
                                }}
                                className={`flex w-full items-center justify-between px-3 py-1.5 text-left transition-colors hover:bg-gray-50 ${
                                    value === u.username ? "bg-blue-50" : ""
                                }`}
                            >
                                <span
                                    className={`text-[13px] ${
                                        value === u.username ? "font-medium text-blue-700" : "text-gray-800"
                                    }`}
                                >
                                    {u.username}
                                </span>
                                {u.role && <span className="text-[11px] text-gray-400 ml-2">{u.role}</span>}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};