import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

import {
    FaUsers,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
    FaUserShield,
} from "react-icons/fa";

import Toast from "./component/Toast";
import ConfirmDialog from "./component/ConfirmDialog";
import RoleBadge from "./component/RoleBadge";
import UserModal from "./modals/UserModal";

import BackButton from "../../reusable/BackButton";

// import { useNavigate } from "react-router-dom";
import usePermissions from "../../hooks/usePermission";
// import {MODULES, ACTIONS} from "./settings/constants/permissions";
import { getCurrentUser } from "../../utils/auth";

export default function Users() {

    const loggedUser = getCurrentUser();
    // const navigate = useNavigate();
    

    // ─── Permission checks ─────────────────────────────────────
    const { can } = usePermissions();

    const canView = can("users", "view");
    const canCreate = can("users", "add");
    const canEdit = can("users", "edit");
    const canDelete = can("users", "delete");

    // ─── State ─────────────────────────────────────────────────
    const [users, setUsers]               = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [search, setSearch]             = useState("");
    const [modal, setModal]               = useState(null);       // { mode: "create"|"edit", user? }
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast]               = useState(null);

    const showToast = (msg, type = "success") => setToast({ msg, type });

    // ─── Fetch users ───────────────────────────────────────────
    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await axiosInstance.get("/auth/users");
            setUsers(res.data.users || []);
        } catch (err) {
            showToast(
                err.response?.data?.message || "Failed to load users",
                "error"
            );
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // ─── Delete handler ────────────────────────────────────────
    // Backend route: DELETE /api/auth/delete/:id
    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/auth/delete/${deleteTarget._id}`);
            showToast("User deleted successfully");
            setDeleteTarget(null);
            fetchUsers();
        } catch (err) {
            showToast(
                err.response?.data?.message || "Delete failed",
                "error"
            );
            setDeleteTarget(null);
        }
    };

    // ─── Modal success callback ────────────────────────────────
    const handleModalSuccess = (msg, type) => {
        showToast(msg, type);
        fetchUsers();
    };

    // ─── Filtered list ─────────────────────────────────────────
    const filteredUsers = users.filter((u) => {
        const name     = (u.username || "").toLowerCase();
        const roleName = (u.roleId?.name || "").toLowerCase();
        const q        = search.toLowerCase();
        return name.includes(q) || roleName.includes(q);
    });

    // ─── Access denied (no USERs_VIEW permission) ───────────────
    if (!canView) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                <FaUserShield className="text-4xl text-gray-200 mx-auto mb-3" />
                <h2 className="text-base font-semibold text-gray-700 mb-1">
                    Access Denied
                </h2>
                <p className="text-sm text-gray-400">
                    You do not have permission to view users.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

            {/* ── HEADER ── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-4">

        {/* BACK BUTTON */}
        <BackButton />

        <div>

            <h2 className="text-base font-semibold text-gray-800">
                Manage Users
            </h2>

            <p className="text-sm text-gray-400 mt-0.5">
                {loadingUsers
                    ? "Loading..."
                    : `${users.length} user${users.length !== 1 ? "s" : ""} total`
                }
            </p>

        </div>
                </div>


                {canCreate && (
                    <button
                        onClick={() => setModal({ mode: "create" })}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-xl transition"
                    >
                        <FaPlus className="text-xs" />
                        Create User
                    </button>
                )}
            </div>

            {/* ── SEARCH ── */}
            <div className="px-6 py-4 border-b border-gray-50">
                <div className="relative max-w-sm">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                        type="text"
                        placeholder="Search by username or role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* ── TABLE ── */}
            <div className="overflow-x-auto">

                {loadingUsers ? (
                    <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                        Loading users...
                    </div>

                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <FaUsers className="text-3xl mb-2 opacity-30" />
                        <p className="text-sm">
                            {search ? "No users match your search" : "No users found"}
                        </p>
                    </div>

                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">#</th>
                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Username</th>
                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Role</th>
                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Status</th>
                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Created</th>
                                {(canEdit || canDelete) && (
                                    <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((u, i) => (
                                <tr key={u._id} className="hover:bg-gray-50 transition">

                                    {/* # */}
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {i + 1}
                                    </td>

                                    {/* Username */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
                                                {u.username?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-gray-800">
                                                {u.username}
                                            </span>
                                            {u._id === loggedUser?.id && (
                                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="px-6 py-4">
                                        <RoleBadge role={u.roleId?.name} />
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                                            u.isActive
                                                ? "bg-green-50 text-green-600"
                                                : "bg-gray-100 text-gray-400"
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                u.isActive ? "bg-green-500" : "bg-gray-400"
                                            }`} />
                                            {u.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    {/* Created */}
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {new Date(u.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>

                                    {/* Actions */}
                                    {(canEdit || canDelete) && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                {canEdit && (
                                                    <button
                                                        onClick={() => setModal({ mode: "edit", user: u })}
                                                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                                                        title="Edit user"
                                                    >
                                                        <FaEdit className="text-sm" />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => setDeleteTarget(u)}
                                                        disabled={u._id === loggedUser?.id}
                                                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title={
                                                            u._id === loggedUser?.id
                                                                ? "Cannot delete your own account"
                                                                : "Delete user"
                                                        }
                                                    >
                                                        <FaTrash className="text-sm" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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