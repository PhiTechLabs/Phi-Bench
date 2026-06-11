import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaShieldAlt, FaPlus, FaCheck } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

export default function UserModal({ mode, user, onClose, onSuccess }) {

    const isEdit = mode === "edit";

    // ─── Form state ────────────────────────────────────────────
    const [form, setForm] = useState({
        username: user?.username || "",
        email: user?.email || "",
        password: "",
        managerId: user?.managerId?._id || "",
    });

    // ─── Role combobox state ───────────────────────────────────
    const [roleInput, setRoleInput]       = useState(
        user?.roleId?.name
            ? user.roleId.name.replace(/_/g, " ")
            : ""
    );

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [selectedRole, setSelectedRole] = useState(user?.roleId?.name || ""); // actual value sent to API
    const [roles, setRoles]               = useState([]);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState(true);

    // ─── Branch state ───────────────────────────────────────
    const [branches, setBranches] = useState([]);
    const [loadingBranches, setLoadingBranches] = useState(true);

    const [selectedBranch, setSelectedBranch] =
        useState(user?.branchId?._id || "");

    const [showBranchForm, setShowBranchForm] =
        useState(false);

    const [newBranch, setNewBranch] =
        useState({
            name: "",
            code: "",
        });

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

    // ─── Fetch branches ───────────────────────────────────────
    useEffect(() => {

        const fetchBranches = async () => {

            try {

                const res =
                    await axiosInstance.get(
                        "/branches"
                    );

                setBranches(
                    res.data.branches || []
                );

            } catch (err) {

                console.error(
                    "Failed to load branches",
                    err
                );

            } finally {

                setLoadingBranches(false);
            }
        };

        fetchBranches();

    }, []);

    // ─── Fetch users for manager dropdown ─────────────────────
    useEffect(() => {

        const fetchUsers = async () => {

            try {

                const res =
                    await axiosInstance.get(
                        "/auth/users"
                    );

                setUsers(
                    res.data.users || []
                );

            } catch (err) {

                console.error(
                    "Failed to load users",
                    err
                );

            } finally {

                setLoadingUsers(false);
            }
        };

        fetchUsers();

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
    const displayName = (name = "") =>
        name
            .replace(/_/g, " ")
            .replace(
                /\b\w/g,
                (c) => c.toUpperCase()
            );

    // Normalise whatever the user typed → snake_case for the API
    const toSnakeCase = (str) =>
        str.trim().toLowerCase().replace(/\s+/g, "_");

    const findRoleByName = (name) => {
        const normalized = toSnakeCase(name);
        return roles.find(
            (r) => r.name === normalized
        );
    };

    const isExistingRole = (input) =>
        roles.some((r) => r.name === toSnakeCase(input));

    const handleRoleSelect = (role) => {
        setSelectedRole(role.name);
        setRoleInput(displayName(role.name));
        setDropdownOpen(false);
        setError("");
    };

    /// When user types in the role input, we optimistically clear the selectedRole
    const handleRoleInputChange = (val) => {
        setRoleInput(val);
        setSelectedRole("");
        setDropdownOpen(true);
        setError("");
    };

    /// â Resolve role: if it exists, return name; if not, create and return new name
    const resolveRole = async (roleName) => {

        const normalizedRole =
            roleName
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_");

        if (!normalizedRole) {
            return null;
        }

        // ─── CHECK EXISTING ROLE ─────────────────
        const existingRole = roles.find(
            (r) => r.name === normalizedRole
        );

        if (existingRole) {
            return existingRole.name;
        }

        // ─── CREATE NEW ROLE ─────────────────────
        try {

            const res = await axiosInstance.post(
                "/roles",
                {
                    name: normalizedRole,

                    description: `${normalizedRole} role`,

                    hierarchyLevel: 99,

                    permissions: [],

                    dataScope: "SELF",
                }
            );

            const newRole = res.data.role;

            // update local roles instantly
            setRoles((prev) => [
                newRole,
                ...prev,
            ]);

            return newRole.name;

        } catch (err) {

            throw new Error(
                err.response?.data?.message ||
                "Failed to create role"
            );
        }
    };

    // ─── Create new branch ───────────────────────────────────
    const createBranch = async () => {

        if (
            !newBranch.name.trim() ||
            !newBranch.code.trim()
        ) {

            setError(
                "Branch name and code are required."
            );

            return;
        }

        try {

            const res =
                await axiosInstance.post(
                    "/branches",
                    {
                        name:
                            newBranch.name.trim(),

                        code:
                            newBranch.code.trim(),
                    }
                );

            const branch =
                res.data.branch;

            setBranches((prev) => [
                branch,
                ...prev,
            ]);

            setSelectedBranch(
                branch._id
            );

            setShowBranchForm(false);

            setNewBranch({
                name: "",
                code: "",
            });

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to create branch"
            );
        }
    };

    // ─── Submit ────────────────────────────────────────────────
    const handleSubmit = async () => {

        if (!form.username.trim()) {

            return setError(
                "Username is required."
            );
        }
        if (!form.email.trim()) {

            return setError(
                "Email is required."
            );
        }

        if (
            !isEdit &&
            !form.password.trim()
        ) {

            return setError(
                "Password is required."
            );
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailRegex.test(form.email)
        ) {

            return setError(
                "Enter a valid email address."
            );
        }

        if (!roleInput.trim()) {

            return setError(
                "Please select or enter a role."
            );
        }

        if (!selectedBranch) {

            return setError(
                "Please select a branch."
            );
        }

        setLoading(true);

        setError("");

        try {

            // ─────────────────────────────────────
            // RESOLVE ROLE
            // ─────────────────────────────────────
            const roleName =
                await resolveRole(roleInput);

            if (!roleName) {

                setLoading(false);

                return setError(
                    "Invalid role selected."
                );
            }

            // ─────────────────────────────────────
            // UPDATE USER
            // ─────────────────────────────────────
            if (isEdit) {

                const payload = {

                    username:
                        form.username.trim(),

                    email:
                        form.email.trim(),

                    role:
                        roleName,

                    branchId:
                        selectedBranch,

                    managerId:
                        form.managerId || null,
                };

                // only update password if entered
                if (form.password.trim()) {

                    payload.password =
                        form.password;
                }

                await axiosInstance.put(
                    `/auth/update/${user._id}`,
                    payload
                );

                onSuccess?.(
                    "User updated successfully",
                    "success"
                );

            }

            // ─────────────────────────────────────
            // CREATE USER
            // ─────────────────────────────────────
            else {

                await axiosInstance.post(
                    "/auth/register",
                    {
                        username:
                            form.username.trim(),

                        email:
                            form.email.trim(),

                        password:
                            form.password,

                        role:
                            roleName,

                        branchId:
                            selectedBranch,

                        managerId:
                            form.managerId || null,
                    }
                );

                onSuccess?.(
                    "User created successfully",
                    "success"
                );
            }

            onClose();

        } catch (err) {

            console.error(err);

            setError(

                err.response?.data?.message ||
                err.message ||

                "Something went wrong."
            );

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
            className="fixed inset-0 bg-black/50 z-998 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className={`bg-white rounded-3xl shadow-2xl w-full transition-all duration-300
                    ${showBranchForm ? "max-w-5xl" : "max-w-2xl"}
                `}
            >

                {/* ── HEADER ── */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isEdit ? "Edit User" : "Create New User"}
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {isEdit
                                ? "Update username, password, or role"
                                : "Fill in the details to add a new user"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"
                    >
                        <RxCross2 />
                    </button>
                </div>

                {/* ── BODY ── */}
                <div className="flex">

                    {/* LEFT SIDE - USER FORM */}
                    <div className="flex-1 px-8 py-7 space-y-5 max-w-xl">

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
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
                                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">
                            Email
                        </label>

                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />

                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => {

                                    setForm((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }));

                                    setError("");
                                }}
                                placeholder="Enter email"
                                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
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
                                className="w-full pl-9 pr-9 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-50 disabled:text-gray-400"
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
                                        <ul className="max-h-44 overflow-y-auto py-3">
                                            {filteredRoles.map((r) => (
                                                <li
                                                    key={r._id}
                                                    onClick={() => handleRoleSelect(r)}
                                                    className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 cursor-pointer group"
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

                    {/* Branch */}
                    <div>

                        <label className="block text-sm font-medium text-gray-600 mb-1.5">
                            Branch
                        </label>

                        <div className="flex gap-2">

                            <select
                                value={selectedBranch}
                                onChange={(e) =>
                                    setSelectedBranch(
                                        e.target.value
                                    )
                                }
                                disabled={loadingBranches}
                                className="flex-1 px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">
                                    Select Branch
                                </option>

                                {branches.map((branch) => (

                                    <option
                                        key={branch._id}
                                        value={branch._id}
                                    >
                                        {branch.name}
                                    </option>

                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={() => setShowBranchForm(true)}
                                className="
                                    w-11
                                    h-11
                                    flex
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-blue-700
                                    hover:bg-blue-800
                                    text-white
                                    shadow-sm
                                    transition
                                "
                            >
                                <FaPlus />
                            </button>

                        </div>

                        <p className="text-xs text-gray-400 mt-1">
                            Assign this user to a branch.
                        </p>

                    </div>

                    {/* Reporting Manager DropDown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">
                            Reporting To
                        </label>

                        <select
                            value={form.managerId}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    managerId: e.target.value,
                                }))
                            }
                            className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="">
                                Select Reporting Manager
                            </option>

                            {users.map((u) => (

                                user?._id === u._id
                                    ? null
                                    : (
                                        <option
                                            key={u._id}
                                            value={u._id}
                                        >
                                            {u.username}
                                        </option>
                                    )

                            ))}
                        </select>

                        <p className="text-xs text-gray-400 mt-1">
                            This user will report to the selected manager.
                        </p>
                    </div>

                    
                        </div>

                    {/* RIGHT SIDE - BRANCH PANEL WILL GO HERE */}
                    {showBranchForm && (

                    <div className="
                        w-[340px]
                        border-l
                        border-gray-200
                        bg-gradient-to-b
                        from-gray-50
                        to-white
                        p-6
                        animate-in
                    ">

                        <div className="flex items-center justify-between mb-5">

                            <div>

                                <h3 className="text-lg font-semibold text-gray-800">
                                    New Branch
                                </h3>

                                <p className="text-xs text-gray-500 mt-1">
                                    Create and assign instantly
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() => setShowBranchForm(false)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <RxCross2 size={18} />
                            </button>

                        </div>

                        <div className="space-y-4">

                            <div>

                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Branch Name
                                </label>

                                <input
                                    type="text"
                                    value={newBranch.name}
                                    onChange={(e) =>
                                        setNewBranch(prev => ({
                                            ...prev,
                                            name: e.target.value
                                        }))
                                    }
                                    placeholder="Noida Branch"
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        rounded-xl
                                        border
                                        border-gray-200
                                        focus:ring-2
                                        focus:ring-blue-500
                                        focus:outline-none
                                    "
                                />

                            </div>

                            <div>

                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Branch Code
                                </label>

                                <input
                                    type="text"
                                    value={newBranch.code}
                                    onChange={(e) =>
                                        setNewBranch(prev => ({
                                            ...prev,
                                            code: e.target.value.toUpperCase()
                                        }))
                                    }
                                    placeholder="NOD001"
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        rounded-xl
                                        border
                                        border-gray-200
                                        focus:ring-2
                                        focus:ring-blue-500
                                        focus:outline-none
                                    "
                                />

                            </div>

                            <button
                                type="button"
                                onClick={createBranch}
                                className="
                                    w-full
                                    bg-blue-700
                                    hover:bg-blue-800
                                    text-white
                                    py-3
                                    rounded-xl
                                    font-medium
                                    transition
                                "
                            >
                                Create Branch
                            </button>

                        </div>

                    </div>

                    )}

                </div>

                    {/* ── FOOTER ── */}
                    <div className="flex gap-3 px-6 pb-6">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
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