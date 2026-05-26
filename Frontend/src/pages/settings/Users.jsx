import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

import {
    FaUsers,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
} from "react-icons/fa";

import Toast from "./component/Toast";
import ConfirmDialog from "./component/ConfirmDialog";
import RoleBadge from "./component/RoleBadge";

import UserModal from "./modals/UserModal";
import {getCurrentUser} from "../../utils/auth";

export default function Users() {

    const api = axiosInstance


    const loggedUser = getCurrentUser();

    const isSuperAdmin =
        loggedUser?.role?.toLowerCase()
            .replace(/\s/g, "") === "superadmin";

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [search, setSearch] = useState("");

    const [modal, setModal] = useState(null);

    const [deleteTarget, setDeleteTarget] = useState(null);

    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") =>
        setToast({ msg, type });

    const fetchUsers = async () => {
        setLoadingUsers(true);

        try {
            const res = await api.get("/auth/users");

            setUsers(res.data.users);

        } catch (err) {

            showToast(
                err.response?.data?.message ||
                "Failed to load users",
                "error"
            );

        } finally {
            setLoadingUsers(false);
        }
    };

        const handleDelete = async () => {
        try {
            await api.delete(`/auth/users/${deleteTarget._id}`);

            showToast(
                "User deleted successfully"
            );

            setDeleteTarget(null);

            fetchUsers();

        } catch (err) {

            showToast(
                err.response?.data?.message ||
                "Delete failed",
                "error"
            );

            setDeleteTarget(null);
        }
    };

    const handleModalSuccess = (msg, type) => {

        showToast(msg, type);

        fetchUsers();
    };

    const filteredUsers = users.filter((u) => {

        const username = u.username || "";

        const roleName = u.roleId?.name || "";

        const searchText = search.toLowerCase();

        return (
            username.toLowerCase().includes(searchText) ||
            roleName.toLowerCase().includes(searchText)
        );
    });
    useEffect(() => {
        fetchUsers();
    }, []);


    if (!isSuperAdmin) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Access Denied
                </h2>

                <p className="text-sm text-gray-500">
                    You do not have permission to manage users.
                </p>
            </div>
        );
    }

    return (

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">

                <div>
                    <h2 className="text-base font-semibold text-gray-800">
                        Manage Users
                    </h2>

                    <p className="text-sm text-gray-400 mt-0.5">
                        {users.length} user
                        {users.length !== 1 ? "s" : ""} total
                    </p>
                </div>

                {isSuperAdmin && (
                    <button
                        onClick={() =>
                            setModal({ mode: "create" })
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-xl transition"
                    >
                        <FaPlus className="text-xs" />

                        Create User
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="px-6 py-4 border-b border-gray-50">

                <div className="relative max-w-sm">

                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />

                    <input
                        type="text"
                        placeholder="Search by name or role..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">

                {loadingUsers ? (

                    <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                        Loading users...
                    </div>

                ) : filteredUsers.length === 0 ? (

                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">

                        <FaUsers className="text-3xl mb-2 opacity-30" />

                        <p className="text-sm">
                            No users found
                        </p>
                    </div>

                ) : (

                    <table className="w-full">

                        <thead>
                            <tr className="bg-gray-50 text-left">

                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">
                                    #
                                </th>

                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">
                                    Username
                                </th>

                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">
                                    Role
                                </th>

                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">
                                    Created
                                </th>

                                <th className="px-6 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">
                                    Actions
                                </th>

                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">

                            {filteredUsers.map((u, i) => (

                                <tr
                                    key={u._id}
                                    className="hover:bg-gray-50 transition"
                                >

                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {i + 1}
                                    </td>

                                    <td className="px-6 py-4">

                                        <div className="flex items-center gap-3">

                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">

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

                                    <td className="px-6 py-4">
                                        <RoleBadge role={u.roleId?.name} />
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-400">

                                        {new Date(
                                            u.createdAt
                                        ).toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            }
                                        )}

                                    </td>

                                    <td className="px-6 py-4">

                                        <div className="flex items-center gap-2">

                                            <button
                                                onClick={() =>
                                                    setModal({
                                                        mode: "edit",
                                                        user: u,
                                                    })
                                                }
                                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                            >
                                                <FaEdit className="text-sm" />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setDeleteTarget(u)
                                                }
                                                disabled={
                                                    u._id === loggedUser?.id
                                                }
                                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
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

            {/* MODALS */}

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
                    onCancel={() =>
                        setDeleteTarget(null)
                    }
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