import { useState, useEffect } from "react";

import {
    FaTimes,
} from "react-icons/fa";

const permissionOptions = [
    {
        label: "None",
        value: "none",
    },
    {
        label: "Own Records",
        value: "own",
    },
    {
        label: "All Records",
        value: "all",
    },
    {
        label:
            "Own/Approved/Waiting for Approvals",
        value: "approval",
    },
    {
        label:
            "Team & Created Records",
        value: "team",
    },
    {
        label:
            "Hierarchy Level Access",
        value: "hierarchy",
    },
    {
        label:
            "Hierarchy & Reporting Access",
        value: "reporting",
    },
];

export default function PermissionModal({
    open,
    onClose,
    role,
    moduleName,
    onSave,
}) {

    // ───────────────── STATE ─────────────────
    const [permissions, setPermissions] =
        useState({
            view: "none",
            edit: "none",
            add: "none",
            delete: "none",
        });

        

    // ───────────────── LOAD EXISTING ─────────────────
useEffect(() => {

    if (!role || !moduleName) return;

    const modulePermission =
        role?.modulePermissions?.[
            moduleName.toLowerCase()
        ];

    setPermissions({
        view:
            modulePermission?.view ||
            "none",

        edit:
            modulePermission?.edit ||
            "none",

        add:
            modulePermission?.add ||
            "none",

        delete:
            modulePermission?.delete ||
            "none",
    });

}, [role, moduleName]);

    // ───────────────── HANDLE CHANGE ─────────────────
    const handleChange = (
        permissionType,
        value
    ) => {

        setPermissions((prev) => ({
            ...prev,
            [permissionType]: value,
        }));
    };

    // ───────────────── SAVE ─────────────────
    const handleSave = () => {

            if (!moduleName) {
                alert("No module selected");
                return;
            }

            onSave({
                module: moduleName.toLowerCase(),
                permissions,
            });
        };

    if (!open) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center">

            {/* BACKDROP */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />

            {/* MODAL */}
            <div className="relative bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-gray-200 p-8 animate-in fade-in zoom-in duration-200">

                {/* HEADER */}
                <div className="flex items-start justify-between mb-8">

                    <div>

                        <h2 className="text-2xl font-semibold text-gray-800">

                            Manage Permissions for{" "}

                            <span className="text-blue-600">
                                {role?.name}
                            </span>

                            {" "}in module{" "}

                            <span className="text-blue-600">
                                {moduleName}
                            </span>

                        </h2>

                        <p className="text-sm text-gray-500 mt-2">
                            Configure module level access
                            permissions for this role.
                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >

                        <FaTimes size={18} />

                    </button>

                </div>

                {/* PERMISSION GRID */}
                <div className="grid grid-cols-4 gap-10">

                    {/* VIEW */}
                    <PermissionColumn
                        title="VIEW RECORDS"
                        type="view"
                        selectedValue={
                            permissions.view
                        }
                        onChange={handleChange}
                    />

                    {/* EDIT */}
                    <PermissionColumn
                        title="EDIT RECORDS"
                        type="edit"
                        selectedValue={
                            permissions.edit
                        }
                        onChange={handleChange}
                    />

                    {/* ADD */}
                    <PermissionColumn
                        title="ADD RECORDS"
                        type="add"
                        selectedValue={
                            permissions.add
                        }
                        onChange={handleChange}
                    />

                    {/* DELETE */}
                    <PermissionColumn
                        title="DELETE RECORDS"
                        type="delete"
                        selectedValue={
                            permissions.delete
                        }
                        onChange={handleChange}
                    />

                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-4 mt-10">

                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
                    >
                        Save Permissions
                    </button>

                </div>

            </div>

        </div>
    );
}

// ───────────────── PERMISSION COLUMN ─────────────────
function PermissionColumn({
    title,
    type,
    selectedValue,
    onChange,
}) {

    return (

        <div>

            <h3 className="text-sm font-semibold text-gray-800 mb-5 tracking-wide">

                {title}

            </h3>

            <div className="space-y-4">

                {permissionOptions.map((option) => (

                    <label
                        key={option.value}
                        className="flex items-start gap-3 cursor-pointer group"
                    >

                        <input
                            type="radio"
                            name={type}
                            checked={
                                selectedValue ===
                                option.value
                            }
                            onChange={() =>
                                onChange(
                                    type,
                                    option.value
                                )
                            }
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />

                        <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-relaxed">

                            {option.label}

                        </span>

                    </label>
                ))}

            </div>

        </div>
    );
}