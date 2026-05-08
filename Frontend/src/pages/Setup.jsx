import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FaUser,
    FaUsers,
    FaPlus,
    FaEdit,
    FaTrash,
    FaEye,
    FaEyeSlash,
    FaArrowLeft,
    FaShieldAlt,
    FaSearch,
    FaTimes,
    FaCheck,
    FaExclamationTriangle,
} from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

// ✅ withCredentials sends HttpOnly cookie automatically
const api = axios.create({
    baseURL: "http://localhost:5000/api/auth",
    withCredentials: true,
});

const getLoggedUser = () => JSON.parse(localStorage.getItem("user"));

// ─── TOAST NOTIFICATION ───────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className={`fixed bottom-6 right-6 z-999 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium animate-slide-up
            ${type === "success" ? "bg-green-600" : "bg-red-500"}`}>
            {type === "success" ? <FaCheck /> : <FaTimes />}
            <span>{msg}</span>
            <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><RxCross2 /></button>
        </div>
    );
};

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ msg, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/50 z-998 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center">
            <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <FaExclamationTriangle className="text-red-500 text-xl" />
                </div>
            </div>
            <h3 className="text-gray-800 font-semibold text-base mb-1">Are you sure?</h3>
            <p className="text-gray-500 text-sm mb-5">{msg}</p>
            <div className="flex gap-3 justify-center">
                <button
                    onClick={onCancel}
                    className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
);

// ─── USER FORM MODAL ──────────────────────────────────────────────────────────
const UserModal = ({ mode, user, onClose, onSuccess }) => {
    const isEdit = mode === "edit";
    const [form, setForm] = useState({
        username: user?.username || "",
        password: "",
        role: user?.role || "client",
    });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!form.username.trim()) return setError("Username is required");
        if (!isEdit && !form.password.trim()) return setError("Password is required");

        setLoading(true);
        setError("");
        try {
            if (isEdit) {
                await api.put(`/update/${user._id}`, form);
                onSuccess("User updated successfully", "success");
            } else {
                await api.post("/register", form);
                onSuccess("User created successfully", "success");
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-998 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {isEdit ? "Edit User" : "Create New User"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
                    >
                        <RxCross2 />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            placeholder="Enter username"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Password {isEdit && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
                        </label>
                        <div className="relative">
                            <input
                                type={showPw ? "text" : "password"}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder={isEdit ? "New password (optional)" : "Enter password"}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPw ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                            <option value="client">Client</option>
                            <option value="admin">Admin</option>
                            <option value="superAdmin">Super Admin</option>
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium transition disabled:opacity-60"
                    >
                        {loading ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── ROLE BADGE ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
    const styles = {
        superAdmin: "bg-purple-100 text-purple-700",
        admin: "bg-blue-100 text-blue-700",
        client: "bg-green-100 text-green-700",
    };
    const labels = {
        superAdmin: "Super Admin",
        admin: "Admin",
        client: "Client",
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[role] || "bg-gray-100 text-gray-600"}`}>
            {labels[role] || role}
        </span>
    );
};

// ─── SIDEBAR ITEMS ────────────────────────────────────────────────────────────
const sidebarItems = [
    { key: "profile", label: "My Profile", icon: <FaUser /> },
    { key: "users", label: "Manage Users", icon: <FaUsers />, superAdminOnly: true },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SETUP PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function Setup() {
    const navigate = useNavigate();
    const loggedUser = getLoggedUser();
    const isSuperAdmin = loggedUser?.role === "superAdmin";

    const [activeTab, setActiveTab] = useState("profile");

    // Users state
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [search, setSearch] = useState("");

    // Modal state
    const [modal, setModal] = useState(null); // { mode: "create" | "edit", user?: {} }
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Toast state
    const [toast, setToast] = useState(null); // { msg, type }

    const showToast = (msg, type = "success") => setToast({ msg, type });

    // Fetch users when tab opens
    useEffect(() => {
        if (activeTab === "users") fetchUsers();
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await api.get("/users");
            setUsers(res.data.users);
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to load users", "error");
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/delete/${deleteTarget._id}`);
            showToast("User deleted successfully");
            setDeleteTarget(null);
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.message || "Delete failed", "error");
            setDeleteTarget(null);
        }
    };

    const handleModalSuccess = (msg, type) => {
        showToast(msg, type);
        if (activeTab === "users") fetchUsers();
    };

    const filteredUsers = users.filter(
        (u) =>
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase())
    );

    // Visible sidebar items based on role
    const visibleSidebar = sidebarItems.filter(
        (item) => !item.superAdminOnly || isSuperAdmin
    );

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── HEADER ── */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
                >
                    <FaArrowLeft className="text-xs" />
                    Back
                </button>
                <div className="h-4 w-px bg-gray-200" />
                <h1 className="text-lg font-semibold text-gray-800">Account Setup</h1>
            </div>

            <div className="flex max-w-6xl mx-auto mt-6 gap-6 px-4 pb-10">

                {/* ── SIDEBAR ── */}
                <aside className="w-56 shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* User info at top of sidebar */}
                        <div className="p-4 bg-blue-700 text-white">
                            <div className="w-12 h-12 rounded-full bg-white text-blue-700 flex items-center justify-center text-xl font-bold mb-2">
                                {loggedUser?.username?.charAt(0)?.toUpperCase()}
                            </div>
                            <p className="font-semibold text-sm truncate">{loggedUser?.username}</p>
                            <p className="text-xs text-blue-200 capitalize">{loggedUser?.role}</p>
                        </div>

                        <nav className="p-2">
                            {visibleSidebar.map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => setActiveTab(item.key)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition mb-1
                                        ${activeTab === item.key
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <span className={activeTab === item.key ? "text-blue-600" : "text-gray-400"}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* ── MAIN CONTENT ── */}
                <main className="flex-1">

                    {/* ── PROFILE TAB ── */}
                    {activeTab === "profile" && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-base font-semibold text-gray-800 mb-5">Profile Information</h2>

                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-20 h-20 rounded-full bg-blue-700 text-white flex items-center justify-center text-3xl font-bold shadow">
                                        {loggedUser?.username?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-xl font-semibold text-gray-800">{loggedUser?.username}</p>
                                        <RoleBadge role={loggedUser?.role} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Username</p>
                                        <p className="text-gray-800 font-medium">{loggedUser?.username}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Role</p>
                                        <p className="text-gray-800 font-medium capitalize">{loggedUser?.role}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">User ID</p>
                                        <p className="text-gray-500 text-xs font-mono">{loggedUser?.id}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Session</p>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                            <p className="text-gray-800 font-medium text-sm">Active</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Security info */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <FaShieldAlt className="text-blue-600" />
                                    <h2 className="text-base font-semibold text-gray-800">Security</h2>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Your session is secured with an <span className="font-medium text-gray-700">HttpOnly JWT cookie</span>.
                                    It expires in 24 hours and cannot be accessed by browser scripts.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── MANAGE USERS TAB (superAdmin only) ── */}
                    {activeTab === "users" && isSuperAdmin && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

                            {/* Tab header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-800">Manage Users</h2>
                                    <p className="text-sm text-gray-400 mt-0.5">
                                        {users.length} user{users.length !== 1 ? "s" : ""} total
                                    </p>
                                </div>
                                <button
                                    onClick={() => setModal({ mode: "create" })}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-xl transition"
                                >
                                    <FaPlus className="text-xs" />
                                    Create User
                                </button>
                            </div>

                            {/* Search */}
                            <div className="px-6 py-4 border-b border-gray-50">
                                <div className="relative max-w-sm">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or role..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Users table */}
                            <div className="overflow-x-auto">
                                {loadingUsers ? (
                                    <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                                        Loading users...
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                        <FaUsers className="text-3xl mb-2 opacity-30" />
                                        <p className="text-sm">No users found</p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 text-left">
                                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">#</th>
                                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Username</th>
                                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Role</th>
                                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Created</th>
                                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredUsers.map((u, i) => (
                                                <tr key={u._id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 text-sm text-gray-400">{i + 1}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                                                                {u.username.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-800">{u.username}</span>
                                                            {u._id === loggedUser?.id && (
                                                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">You</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                                                    <td className="px-6 py-4 text-sm text-gray-400">
                                                        {new Date(u.createdAt).toLocaleDateString("en-IN", {
                                                            day: "numeric", month: "short", year: "numeric"
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setModal({ mode: "edit", user: u })}
                                                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                                                title="Edit"
                                                            >
                                                                <FaEdit className="text-sm" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteTarget(u)}
                                                                disabled={u._id === loggedUser?.id}
                                                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                                title={u._id === loggedUser?.id ? "Can't delete yourself" : "Delete"}
                                                            >
                                                                <FaTrash className="text-sm" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* ── MODALS ── */}
            {modal && (
                <UserModal
                    mode={modal.mode}
                    user={modal.user}
                    onClose={() => setModal(null)}
                    onSuccess={handleModalSuccess}
                />
            )}

            {deleteTarget && (
                <ConfirmDialog
                    msg={`This will permanently delete "${deleteTarget.username}". This cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            {toast && (
                <Toast
                    msg={toast.msg}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}