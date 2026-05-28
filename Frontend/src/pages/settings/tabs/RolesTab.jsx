import { useEffect, useState, useRef } from "react";

import {
    FaEdit,
    FaTrash,
    FaPlus,
    FaShieldAlt,
    FaArrowLeft,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import BackButton from "../../../reusable/BackButton";

import axiosInstance from "../../../api/axiosInstance";

import RoleModal from "../modals/RoleModal";

export default function RolesTab() {

    const navigate = useNavigate();

    const [roles, setRoles] = useState([]);

    const [loading, setLoading] = useState(true);

    const [openModal, setOpenModal] = useState(false);

    const [selectedRole, setSelectedRole] =
        useState(null);

    // ───────────────── DELETE POPUP ─────────────────
    const [deletePopup, setDeletePopup] =
        useState({
            open: false,
            roleId: null,
        });

    // ───────────────── COLUMN WIDTHS ─────────────────
    const [columnWidths, setColumnWidths] = useState({
        roles: 26,
        users: 18,
        privileges: 22,
        created: 18,
        actions: 16,
    });

    const resizingColumn = useRef(null);

    // ───────────────── FETCH ROLES ─────────────────
    const fetchRoles = async () => {

        try {

            setLoading(true);

            const res = await axiosInstance.get(
                "/roles"
            );

            setRoles(res.data.roles || []);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    // ───────────────── OPEN DELETE POPUP ─────────────────
    const openDeletePopup = (roleId) => {

        setDeletePopup({
            open: true,
            roleId,
        });
    };

    // ───────────────── CLOSE DELETE POPUP ─────────────────
    const closeDeletePopup = () => {

        setDeletePopup({
            open: false,
            roleId: null,
        });
    };

    // ───────────────── DELETE ROLE ─────────────────
    const handleDelete = async () => {

        try {

            await axiosInstance.delete(
                `/roles/${deletePopup.roleId}`
            );

            fetchRoles();

            closeDeletePopup();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to delete role"
            );
        }
    };

    // ───────────────── RESIZE COLUMN ─────────────────
    const startResize = (column, e) => {

        resizingColumn.current = {
            column,
            startX: e.clientX,
            startWidth: columnWidths[column],
        };

        document.addEventListener(
            "mousemove",
            handleMouseMove
        );

        document.addEventListener(
            "mouseup",
            stopResize
        );
    };

    const handleMouseMove = (e) => {

        if (!resizingColumn.current) return;

        const {
            column,
            startX,
            startWidth,
        } = resizingColumn.current;

        const diff = e.clientX - startX;

        const tableWidth = window.innerWidth;

        const percentChange =
            (diff / tableWidth) * 100;

        const newWidth =
            startWidth + percentChange;

        if (newWidth < 8) return;

        setColumnWidths((prev) => ({
            ...prev,
            [column]: newWidth,
        }));
    };

    const stopResize = () => {

        resizingColumn.current = null;

        document.removeEventListener(
            "mousemove",
            handleMouseMove
        );

        document.removeEventListener(
            "mouseup",
            stopResize
        );
    };

    return (

        <>
            {/* DELETE POPUP */}
            {deletePopup.open && (

                <div className="fixed inset-0 z-50 flex items-center justify-center">

                    {/* BACKDROP */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
                        onClick={closeDeletePopup}
                    />

                    {/* POPUP */}
                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 p-7 animate-in fade-in zoom-in duration-200">

                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto">

                            <FaTrash className="text-red-600 text-xl" />

                        </div>

                        <div className="text-center mt-5">

                            <h3 className="text-xl font-semibold text-gray-800">
                                Delete Role
                            </h3>

                            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                                Are you sure you want to
                                delete this role?
                                <br />
                                This action cannot be undone.
                            </p>

                        </div>

                        <div className="flex items-center justify-center gap-3 mt-7">

                            <button
                                onClick={closeDeletePopup}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-5 border-b border-gray-200">

                    <div className="flex items-center gap-4">

                    {/* BACK BUTTON */}
                    <BackButton />

                    <div>

                        <h2 className="text-2xl font-semibold text-gray-800">
                            Roles
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Configure organization roles and permissions.
                        </p>

                    </div>

                </div>

                    <button
                        onClick={() => {
                            setSelectedRole(null);
                            setOpenModal(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                    >

                        <FaPlus className="text-xs" />

                        Add Role

                    </button>

                </div>

                {/* TABLE */}
                <div className="w-full overflow-hidden">

                    <table className="w-full table-fixed border-collapse">

                        <thead className="bg-gray-50">

                            <tr className="border-b-2 border-gray-300">

                                {/* ROLES */}
                                <th
                                    style={{
                                        width: `${columnWidths.roles}%`,
                                    }}
                                    className="relative px-5 py-5 text-left text-[13px] font-bold tracking-wide text-gray-700 border-r border-gray-300"
                                >

                                    ROLES

                                    <div
                                        onMouseDown={(e) =>
                                            startResize(
                                                "roles",
                                                e
                                            )
                                        }
                                        className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-sky-300 transition"
                                    />

                                </th>

                                {/* USERS */}
                                <th
                                    style={{
                                        width: `${columnWidths.users}%`,
                                    }}
                                    className="relative px-4 py-5 text-center text-[13px] font-bold tracking-wide text-gray-700 border-r border-gray-300"
                                >

                                    USERS

                                    <div
                                        onMouseDown={(e) =>
                                            startResize(
                                                "users",
                                                e
                                            )
                                        }
                                        className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-sky-300 transition"
                                    />

                                </th>

                                {/* PRIVILEGES */}
                                <th
                                    style={{
                                        width: `${columnWidths.privileges}%`,
                                    }}
                                    className="relative px-4 py-5 text-center text-[13px] font-bold tracking-wide text-gray-700 border-r border-gray-300"
                                >

                                    PRIVILEGES

                                    <div
                                        onMouseDown={(e) =>
                                            startResize(
                                                "privileges",
                                                e
                                            )
                                        }
                                        className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-sky-300 transition"
                                    />

                                </th>

                                {/* CREATED */}
                                <th
                                    style={{
                                        width: `${columnWidths.created}%`,
                                    }}
                                    className="relative px-4 py-5 text-center text-[13px] font-bold tracking-wide text-gray-700 border-r border-gray-300"
                                >

                                    CREATED ON

                                    <div
                                        onMouseDown={(e) =>
                                            startResize(
                                                "created",
                                                e
                                            )
                                        }
                                        className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-sky-300 transition"
                                    />

                                </th>

                                {/* ACTIONS */}
                                <th
                                    style={{
                                        width: `${columnWidths.actions}%`,
                                    }}
                                    className="relative px-4 py-5 text-center text-[13px] font-bold tracking-wide text-gray-700"
                                >

                                    ACTIONS

                                    <div
                                        onMouseDown={(e) =>
                                            startResize(
                                                "actions",
                                                e
                                            )
                                        }
                                        className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-sky-300 transition"
                                    />

                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan={5}
                                        className="text-center py-10 text-sm text-gray-500"
                                    >
                                        Loading roles...
                                    </td>

                                </tr>

                            ) : roles.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={5}
                                        className="text-center py-10 text-sm text-gray-500"
                                    >
                                        No roles found
                                    </td>

                                </tr>

                            ) : (

                                roles.map((role) => (

                                    <tr
                                        key={role._id}
                                        className="border-b border-gray-200 hover:bg-sky-50 transition-all duration-200"
                                    >

                                        {/* ROLE */}
                                        <td className="px-5 py-4 border-r border-gray-200">

                                            <div className="flex items-center gap-3">

                                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">

                                                    <FaShieldAlt size={13} />

                                                </div>

                                                <h3 className="font-medium text-sm text-gray-800 capitalize truncate">

                                                    {role.name.replace(
                                                        /_/g,
                                                        " "
                                                    )}

                                                </h3>

                                            </div>

                                        </td>

                                        {/* USER COUNT */}
                                        <td className="px-4 py-4 text-center border-r border-gray-200">

                                            <span className="text-blue-600 font-semibold text-sm">

                                                {role.userCount || 0}

                                            </span>

                                        </td>

                                        {/* PRIVILEGES */}
                                        <td className="px-4 py-4 text-center border-r border-gray-200">

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/settings/permissions/${role._id}`
                                                    )
                                                }
                                                className="text-blue-600 hover:text-sky-500 text-sm font-semibold transition"
                                            >

                                                Edit Permissions

                                            </button>

                                        </td>

                                        {/* CREATED ON */}
                                        <td className="px-4 py-4 text-center border-r border-gray-200">

                                            <div className="text-sm text-gray-700 font-medium">

                                                {new Date(
                                                    role.createdAt
                                                ).toLocaleDateString(
                                                    "en-GB"
                                                )}

                                            </div>

                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-4 py-4">

                                            <div className="flex items-center justify-center gap-4">

                                                <button
                                                    onClick={() => {
                                                        setSelectedRole(
                                                            role
                                                        );

                                                        setOpenModal(
                                                            true
                                                        );
                                                    }}
                                                    className="text-gray-500 hover:text-sky-600 transition-all duration-200 hover:scale-110"
                                                >

                                                    <FaEdit size={14} />

                                                </button>

                                                {!role.isSystemRole && (

                                                    <button
                                                        onClick={() =>
                                                            openDeletePopup(
                                                                role._id
                                                            )
                                                        }
                                                        className="text-gray-500 hover:text-red-600 transition-all duration-200 hover:scale-110"
                                                    >

                                                        <FaTrash size={14} />

                                                    </button>
                                                )}

                                            </div>

                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>

                </div>

                {/* MODAL */}
                <RoleModal
                    open={openModal}
                    onClose={() =>
                        setOpenModal(false)
                    }
                    role={selectedRole}
                    onSuccess={fetchRoles}
                />

            </div>
        </>
    );
}