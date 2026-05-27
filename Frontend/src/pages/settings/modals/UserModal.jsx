import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaShieldAlt, FaPlus, FaCheck } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

export default function UserModal({ mode, user, onClose, onSuccess }) {

    const isEdit = mode === "edit";

    // ─── Form state ────────────────────────────────────────────
    const [form, setForm] = useState({
        username: user?.username || "",
        password: "",
    });

    // ─── Role combobox state ───────────────────────────────────
    const [roleInput, setRoleInput]       = useState(
        user?.roleId?.name
            ? user.roleId.name.replace(/_/g, " ")
            : ""
    );
    const [selectedRole, setSelectedRole] = useState(user?.roleId?.name || ""); // actual value sent to API
    const [roles, setRoles]               = useState([]);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState(true);

    // ─── UI state ──────────────────────────────────────────────
    const [showPw, setShowPw]   = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const dropdownRef = useRef(null);
    const inputRef    = useRef(null);

    // ─── Close dropdown on outside click ──────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ─── Fetch existing roles ──────────────────────────────────
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await axiosInstance.get("/roles");
                setRoles(res.data.roles || []);
                setFilteredRoles(res.data.roles || []);
            } catch {
                // non-fatal — user can still type a role name manually
            } finally {
                setLoadingRoles(false);
            }
        };
        fetchRoles();
    }, []);

    // ─── Filter dropdown as user types ────────────────────────
    useEffect(() => {
        const q = roleInput.toLowerCase().replace(/\s/g, "_");
        const filtered = roles.filter((r) =>
            r.name.includes(q) ||
            r.name.replace(/_/g, " ").includes(roleInput.toLowerCase())
        );
        setFilteredRoles(filtered);
    }, [roleInput, roles]);

    // ─── Helpers ───────────────────────────────────────────────
    const displayName = (name) =>
        name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    // Normalise whatever the user typed → snake_case for the API
    const toSnakeCase = (str) =>
        str.trim().toLowerCase().replace(/\s+/g, "_");

    const isExistingRole = (input) =>
        roles.some((r) => r.name === toSnakeCase(input));

    const handleRoleSelect = (role) => {
        setSelectedRole(role.name);
        setRoleInput(displayName(role.name));
        setDropdownOpen(false);
        setError("");
    };

    const handleRoleInputChange = (val) => {
        setRoleInput(val);
        setSelectedRole("");           // clear confirmed selection when user edits
        setDropdownOpen(true);
        setError("");
    };

    // ─── Resolve role: existing → use it; new → create first ──
    // const resolveRole = async () => {
    //     const snake = toSnakeCase(roleInput);
    //     if (!snake) return null;

    //     // Already confirmed from dropdown
    //     if (selectedRole) return selectedRole;

    //     // Check if it matches an existing role
    //     const match = roles.find((r) => r.name === snake);
    //     if (match) return match.name;

    //     // New role — create it on the fly
    //     const res = await axiosInstance.post("/roles", {
    //         name: snake,
    //         description: "",
    //         hierarchyLevel: 99,          // default low hierarchy
    //         permissions: [],
    //         dataScope: "SELF",
    //     });
    //     return res.data.role.name;
    // };

    const resolveRole = (roleName) => {
        return roleName
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");
    };

    // ─── Submit ────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!form.username.trim()) {
            return setError("Username is required.");
        }

        if (!isEdit && !form.password.trim()) {
            return setError("Password is required.");
        }

        if (!roleInput.trim()) {
            return setError("Please select or enter a role.");
        }

        setLoading(true);
        setError("");

        try {
            // Normalize role name only
            const roleName = resolveRole(roleInput);

            if (!roleName) {
                setError("Invalid role.");
                setLoading(false);
                return;
            }

            if (isEdit) {
                const payload = {
                    username: form.username.trim(),
                    role: roleName,
                };

                if (form.password.trim()) {
                    payload.password = form.password;
                }

                await axiosInstance.put(
                    `/auth/update/${user._id}`,
                    payload
                );

                onSuccess("User updated successfully", "success");

            } else {

                await axiosInstance.post("/auth/register", {
                    username: form.username.trim(),
                    password: form.password,
                    role: roleName,
                });

                onSuccess("User created successfully", "success");
            }

            onClose();

        } catch (err) {
            // setError(
            //     err.response?.data?.message ||
            //     "Something went wrong."
            // );

            const message =
                err.response?.status === 404
                    ? "Requested action could not be completed."
                    : err.response?.data?.message || "Something went wrong.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // ─── Whether to show "Create new role" option ─────────────
    const showCreateOption =
        roleInput.trim().length > 0 &&
        !isExistingRole(roleInput) &&
        !selectedRole;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-[998] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

                {/* ── HEADER ── */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">
                            {isEdit ? "Edit User" : "Create New User"}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {isEdit
                                ? "Update username, password, or role"
                                : "Fill in the details to add a new user"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"
                    >
                        <RxCross2 />
                    </button>
                </div>

                {/* ── BODY ── */}
                <div className="px-6 py-5 space-y-4">

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                            <span>⚠</span> {error}
                        </div>
                    )}

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">
                            Username
                        </label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                            <input
                                type="text"
                                value={form.username}
                                onChange={(e) => {
                                    setError("");
                                    setForm((p) => ({ ...p, username: e.target.value }));
                                }}
                                placeholder="Enter username"
                                autoFocus
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">
                            Password{" "}
                            {isEdit && (
                                <span className="text-gray-400 font-normal">
                                    (leave blank to keep current)
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                            <input
                                type={showPw ? "text" : "password"}
                                value={form.password}
                                onChange={(e) => {
                                    setError("");
                                    setForm((p) => ({ ...p, password: e.target.value }));
                                }}
                                placeholder={isEdit ? "New password (optional)" : "Enter password"}
                                className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showPw ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Role — combobox ──────────────────────────────── */}
                    <div ref={dropdownRef}>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">
                            Role
                            <span className="ml-1.5 text-xs text-gray-400 font-normal">
                                (pick existing or type a new one)
                            </span>
                        </label>

                        <div className="relative">
                            <FaShieldAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none" />

                            <input
                                ref={inputRef}
                                type="text"
                                value={roleInput}
                                onChange={(e) => handleRoleInputChange(e.target.value)}
                                onFocus={() => setDropdownOpen(true)}
                                placeholder={loadingRoles ? "Loading roles..." : "Search or type a role..."}
                                disabled={loadingRoles}
                                className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                            />

                            {/* Clear button */}
                            {roleInput && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRoleInput("");
                                        setSelectedRole("");
                                        setDropdownOpen(true);
                                        inputRef.current?.focus();
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"
                                >
                                    <RxCross2 className="text-xs" />
                                </button>
                            )}

                            {/* Confirmed checkmark */}
                            {selectedRole && (
                                <FaCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xs pointer-events-none" />
                            )}

                            {/* ── DROPDOWN ── */}
                            {dropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">

                                    {/* Existing roles list */}
                                    {filteredRoles.length > 0 && (
                                        <ul className="max-h-44 overflow-y-auto py-1">
                                            {filteredRoles.map((r) => (
                                                <li
                                                    key={r._id}
                                                    onClick={() => handleRoleSelect(r)}
                                                    className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 cursor-pointer group"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                                                            {displayName(r.name)}
                                                        </p>
                                                        {r.description && (
                                                            <p className="text-xs text-gray-400">
                                                                {r.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-300 group-hover:text-blue-400">
                                                        L{r.hierarchyLevel}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* No match + create option */}
                                    {showCreateOption && (
                                        <div className="border-t border-gray-100">
                                            <div
                                                onClick={() => {
                                                    // Optimistically confirm — actual creation happens on submit
                                                    setSelectedRole(toSnakeCase(roleInput));
                                                    setRoleInput(
                                                        roleInput.trim().replace(/\b\w/g, (c) => c.toUpperCase())
                                                    );
                                                    setDropdownOpen(false);
                                                }}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 cursor-pointer group"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                    <FaPlus className="text-green-600 text-[10px]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-green-700">
                                                        Create &amp; use "
                                                        <span className="font-semibold">
                                                            {roleInput.trim()
                                                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                                                        </span>
                                                        "
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        New role will be created and assigned
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty state */}
                                    {filteredRoles.length === 0 && !showCreateOption && (
                                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                                            No roles found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Helper text */}
                        <p className="text-xs text-gray-400 mt-1.5 pl-0.5">
                            {selectedRole && !isExistingRole(roleInput)
                                ? "⚡ A new role will be created automatically on submit"
                                : selectedRole
                                    ? `✓ Role confirmed`
                                    : "Type to search existing roles, or enter a new role name"
                            }
                        </p>
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div className="flex gap-3 px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading
                            ? isEdit ? "Saving..." : "Creating..."
                            : isEdit ? "Save Changes" : "Create User"
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}