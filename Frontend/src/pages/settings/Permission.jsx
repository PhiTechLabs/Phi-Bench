import { useEffect, useState } from "react";

import axiosInstance from "../../api/axiosInstance";

import PermissionModal from "./modals/PermissionModal";
import ActivityDrawer from "../../components/permissions/ActivityDrawer";

import BackButton from "../../reusable/BackButton";

import {
    FaPen,
    FaCheckCircle,
    FaTimesCircle,
    FaChevronDown,
    FaHistory,
} from "react-icons/fa";

export default function Permissions() {

    // ───────────────── MODULES ─────────────────
    const modules = [
        "Home",
        "Job",
        "Candidate",
        "Bench",
        "Submissions",
        "Interview",
        "Clients",
        "Report",
    ];

    // ───────────────── STATES ─────────────────
    const [selectedModule, setSelectedModule] =
        useState(() =>
            localStorage.getItem("selectedPermissionModule") || "Home"
    );

    const [roles, setRoles] = useState([]);

    const handleModuleChange = (value) => {

        setSelectedModule(value);

        localStorage.setItem(
            "selectedPermissionModule",
            value
        );
    };

    const [
        openPermissionModal,
        setOpenPermissionModal,
    ] = useState(false);

    const [selectedRole, setSelectedRole] =
        useState(null);

    // ───────────────── ACTIVITY DRAWER STATE ─────────────────
    const [activityOpen, setActivityOpen] = useState(false);

    // ───────────────── SAFE MODULE KEY ─────────────────
    const currentModuleKey =
        selectedModule
            ? selectedModule.toLowerCase()
            : "";

    // ───────────────── FETCH ROLES ─────────────────
    const fetchRoles = async () => {

        try {

            const res =
                await axiosInstance.get("/roles");

            setRoles(res.data.roles || []);

        } catch (error) {

            console.error(error);
        }
    };

    const handlePermissionSave = async (data) => {

        try {

            await axiosInstance.put(
                `/roles/${selectedRole._id}/permissions`,
                data
            );

            alert("Permissions updated successfully");

            setOpenPermissionModal(false);

            fetchRoles();

        } catch (error) {

            console.error(error);

            alert(
                error?.response?.data?.message ||
                "Failed to update permissions"
            );
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    return (

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">

                <div className="flex items-center gap-4">
                    <div>
                        <BackButton />
                    </div>

                    <h1 className="text-2xl font-semibold text-gray-800">

                        Permissions

                        {selectedModule && (
                            <span className="text-blue-600">
                                {" "}
                                &gt; {selectedModule}
                            </span>
                        )}

                    </h1>

                </div>

                <button
                    onClick={() => setActivityOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition text-sm font-medium text-gray-700"
                >

                    <FaHistory />

                    Activities

                </button>

            </div>

            {/* MODULE DROPDOWN */}
            <div className="flex items-center gap-4 mb-6">

                <div className="text-sm font-medium text-gray-600">

                    Assign permissions for the module

                </div>

                <div className="w-65 relative">

                    <select
                        value={selectedModule}
                        onChange={(e) =>
                            handleModuleChange(e.target.value)
                        }
                        className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-200"
                    >

                        {modules.map((module) => (

                            <option
                                key={module}
                                value={module}
                            >
                                {module}
                            </option>
                        ))}

                    </select>

                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />

                </div>

            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-2xl border border-gray-200">

                <table className="w-full border-collapse">

                    <thead className="bg-gray-50">

                        <tr className="border-b border-gray-200">

                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200">
                                ROLES
                            </th>

                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200">
                                VIEW
                            </th>

                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200">
                                EDIT
                            </th>

                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200">
                                ADD
                            </th>

                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                DELETE
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {roles.map((role, index) => {

                            const modulePermissions =
                                currentModuleKey
                                    ? role
                                            ?.modulePermissions?.[
                                            currentModuleKey
                                        ]
                                    : null;

                            return (

                                <tr
                                    key={index}
                                    className="border-b border-gray-200 hover:bg-sky-50 transition-all duration-200"
                                >

                                    <td className="px-6 py-5 border-r border-gray-200">

                                        <div className="flex items-center gap-3">

                                            <button
                                                onClick={() => {

                                                    if (
                                                        !selectedModule
                                                    ) {

                                                        alert(
                                                            "Please select a module first."
                                                        );

                                                        return;
                                                    }

                                                    setSelectedRole(
                                                        role
                                                    );

                                                    setOpenPermissionModal(
                                                        true
                                                    );
                                                }}
                                                className="text-gray-500 hover:text-blue-600 transition"
                                            >

                                                <FaPen size={13} />

                                            </button>

                                            <span className="font-medium text-gray-800 capitalize">

                                                {role.name?.replace(
                                                    /_/g,
                                                    " "
                                                )}

                                            </span>

                                        </div>

                                    </td>

                                    <td className="px-6 py-5 border-r border-gray-200">

                                        <PermissionStatus
                                            allowed={
                                                modulePermissions?.view ||
                                                false
                                            }
                                        />

                                    </td>

                                    <td className="px-6 py-5 border-r border-gray-200">

                                        <PermissionStatus
                                            allowed={
                                                modulePermissions?.edit ||
                                                false
                                            }
                                        />

                                    </td>

                                    <td className="px-6 py-5 border-r border-gray-200">

                                        <PermissionStatus
                                            allowed={
                                                modulePermissions?.add ||
                                                false
                                            }
                                        />

                                    </td>

                                    <td className="px-6 py-5">

                                        <PermissionStatus
                                            allowed={
                                                modulePermissions?.delete ||
                                                false
                                            }
                                        />

                                    </td>

                                </tr>
                            );
                        })}

                    </tbody>

                </table>

            </div>

            {/* PERMISSION MODAL */}
            <PermissionModal
                open={openPermissionModal}
                onClose={() =>
                    setOpenPermissionModal(false)
                }
                role={selectedRole}
                moduleName={selectedModule}
                onSave={handlePermissionSave}
            />

            {/* ACTIVITY DRAWER */}
            <ActivityDrawer
                open={activityOpen}
                onClose={() => setActivityOpen(false)}
                module={selectedModule}
            />

        </div>
    );
}

// ───────────────── STATUS COMPONENT ─────────────────
function PermissionStatus({ allowed }) {

    const isAllowed =
        allowed &&
        allowed !== "none";

    return (

        <div
            className={`flex items-center gap-2 text-sm font-medium ${
                isAllowed
                    ? "text-green-600"
                    : "text-red-500"
            }`}
        >

            {isAllowed ? (
                <FaCheckCircle />
            ) : (
                <FaTimesCircle />
            )}

            <span>
                {isAllowed
                    ? "Allowed"
                    : "Denied"}
            </span>

        </div>
    );
}