import React, { useEffect, useState, useRef, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import { FaUsers, FaPlus, FaEdit, FaTrash, FaSearch, FaUserShield } from "react-icons/fa";
import Toast from "./component/Toast";
import ConfirmDialog from "./component/ConfirmDialog";
import RoleBadge from "./component/RoleBadge";
import UserModal from "./modals/UserModal";
import BackButton from "../../reusable/BackButton";
import usePermissions from "../../hooks/usePermission";
import { getCurrentUser } from "../../utils/auth";

// ─── COLUMN DEFINITIONS ───────────────────────────────────────────────────────
const DEFAULT_COLS = [
    { key: "no",         label: "#",          width: 52,  minWidth: 40  },
    { key: "username",   label: "Username",   width: 200, minWidth: 100 },
    { key: "email",      label: "Email",      width: 220, minWidth: 100 },
    { key: "role",       label: "Role",       width: 150, minWidth: 80  },
    { key: "reportsTo",  label: "Reports To", width: 200, minWidth: 100 },
    { key: "status",     label: "Status",     width: 100, minWidth: 70  },
    { key: "created",    label: "Created",    width: 130, minWidth: 90  },
    { key: "actions",    label: "Actions",    width: 90,  minWidth: 70  },
];

// ─── RESIZABLE HEADER CELL ────────────────────────────────────────────────────
const ResizableTh = ({ col, onResize, children }) => {
    const startX  = useRef(null);
    const startW  = useRef(null);

    const onMouseDown = (e) => {
        e.preventDefault();
        startX.current = e.clientX;
        startW.current = col.width;

        const onMove = (mv) => {
            const delta = mv.clientX - startX.current;
            const next  = Math.max(col.minWidth, startW.current + delta);
            onResize(col.key, next);
        };
        const onUp = () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup",   onUp);
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup",   onUp);
    };

    return (
        <th
            style={{ width: col.width, minWidth: col.minWidth, maxWidth: col.width, position: "relative" }}
            className="px-3 py-3 text-left text-xs text-gray-400 font-semibold uppercase tracking-wide bg-gray-50 select-none overflow-hidden"
        >
            <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                {children}
            </div>
            {/* resize handle */}
            <div
                onMouseDown={onMouseDown}
                style={{
                    position:   "absolute",
                    right:       0,
                    top:         0,
                    height:      "100%",
                    width:       5,
                    cursor:      "col-resize",
                    userSelect:  "none",
                    zIndex:      10,
                }}
                className="hover:bg-blue-400 transition-colors"
            />
        </th>
    );
};

// ─── CLIPPED CELL ────────────────────────────────────────────────────────────
const ClipTd = ({ width, className = "", children }) => (
    <td
        style={{ width, minWidth: width, maxWidth: width, overflow: "hidden" }}
        className={`px-3 py-3.5 text-sm align-middle ${className}`}
    >
        <div style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            {children}
        </div>
    </td>
);

// ═══════════════════════════════════════════════════════════════════════════════
export default function Users() {
    const loggedUser = getCurrentUser();
    const { can }    = usePermissions();

    const canView   = can("users", "view");
    const canCreate = can("users", "add");
    const canEdit   = can("users", "edit");
    const canDelete = can("users", "delete");

    const [users,        setUsers]        = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [search,       setSearch]       = useState("");
    const [modal,        setModal]        = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast,        setToast]        = useState(null);
    const [cols,         setCols]         = useState(DEFAULT_COLS);

    const showToast = (msg, type = "success") => setToast({ msg, type });

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await axiosInstance.get("/auth/users");
            setUsers(res.data.users || []);
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to load users", "error");
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleResize = useCallback((key, width) => {
        setCols((prev) => prev.map((c) => c.key === key ? { ...c, width } : c));
    }, []);

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/auth/delete/${deleteTarget._id}`);
            showToast("User deleted successfully");
            setDeleteTarget(null);
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.message || "Delete failed", "error");
            setDeleteTarget(null);
        }
    };

    const handleModalSuccess = (msg, type) => { showToast(msg, type); fetchUsers(); };

    const filteredUsers = users.filter((u) => {
        const q = search.toLowerCase();
        return (
            (u.username      || "").toLowerCase().includes(q) ||
            (u.email         || "").toLowerCase().includes(q) ||
            (u.roleId?.name  || "").toLowerCase().includes(q)
        );
    });

    const col = (key) => cols.find((c) => c.key === key);

    if (!canView) return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <FaUserShield className="text-4xl text-gray-200 mx-auto mb-3" />
            <h2 className="text-base font-semibold text-gray-700 mb-1">Access Denied</h2>
            <p className="text-sm text-gray-400">You do not have permission to view users.</p>
        </div>
    );

    const totalWidth = cols.reduce((s, c) => s + c.width, 0);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">

            {/* ── HEADER ── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Manage Users</h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {loadingUsers ? "Loading…" : `${users.length} user${users.length !== 1 ? "s" : ""} total`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* reset column widths */}
                    <button
                        onClick={() => setCols(DEFAULT_COLS)}
                        className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition"
                    >
                        Reset columns
                    </button>
                    {canCreate && (
                        <button
                            onClick={() => setModal({ mode: "create" })}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-xl transition"
                        >
                            <FaPlus className="text-xs" /> Create User
                        </button>
                    )}
                </div>
            </div>

            {/* ── SEARCH ── */}
            <div className="px-6 py-4 border-b border-gray-50">
                <div className="relative max-w-sm">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                        type="text"
                        placeholder="Search by username, email or role…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* ── TABLE ── */}
            <div className="overflow-x-auto">
                {loadingUsers ? (
                    <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading users…</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <FaUsers className="text-3xl mb-2 opacity-30" />
                        <p className="text-sm">{search ? "No users match your search" : "No users found"}</p>
                    </div>
                ) : (
                    <table
                        className="border-collapse"
                        style={{ width: totalWidth, minWidth: totalWidth, tableLayout: "fixed" }}
                    >
                        <thead>
                            <tr>
                                {cols.map((c) => (
                                    <ResizableTh key={c.key} col={c} onResize={handleResize}>
                                        {c.key === "actions" && !(canEdit || canDelete) ? null : c.label}
                                    </ResizableTh>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((u, i) => (
                                <tr key={u._id} className="hover:bg-gray-50 transition">

                                    {/* # */}
                                    <ClipTd width={col("no").width} className="text-gray-400">
                                        {i + 1}
                                    </ClipTd>

                                    {/* Username */}
                                    <ClipTd width={col("username").width}>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                {u.username?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-800 truncate">
                                                {u.username}
                                            </span>
                                            {u._id === loggedUser?.id && (
                                                <span className="shrink-0 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                    </ClipTd>

                                    {/* Email */}
                                    <ClipTd width={col("email").width} className="text-gray-500">
                                        {u.email || "—"}
                                    </ClipTd>

                                    {/* Role */}
                                    <ClipTd width={col("role").width}>
                                        <RoleBadge role={u.roleId?.name} />
                                    </ClipTd>

                                    {/* Reports To */}
                                    <ClipTd width={col("reportsTo").width}>
                                        {u.managerId ? (
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {u.managerId.username?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate leading-tight">
                                                        {u.managerId.username}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate leading-tight">
                                                        {u.managerId.email}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-300 italic">No manager</span>
                                        )}
                                    </ClipTd>

                                    {/* Status */}
                                    <ClipTd width={col("status").width}>
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                                            u.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                                            {u.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </ClipTd>

                                    {/* Created */}
                                    <ClipTd width={col("created").width} className="text-gray-400">
                                        {new Date(u.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric", month: "short", year: "numeric",
                                        })}
                                    </ClipTd>

                                    {/* Actions */}
                                    {(canEdit || canDelete) && (
                                        <ClipTd width={col("actions").width}>
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
                                                        title={u._id === loggedUser?.id ? "Cannot delete your own account" : "Delete user"}
                                                    >
                                                        <FaTrash className="text-sm" />
                                                    </button>
                                                )}
                                            </div>
                                        </ClipTd>
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
                <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
}