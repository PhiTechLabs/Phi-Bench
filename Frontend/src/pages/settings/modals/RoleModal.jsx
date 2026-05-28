import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";

export default function RoleModal({
    open,
    onClose,
    role,
    onSuccess,
}) {

    const isEdit = !!role;

    const [loading, setLoading] = useState(false);

    const [permissions, setPermissions] = useState([]);

    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        description: "",
        hierarchyLevel: 99,
        dataScope: "SELF",
        permissions: [],
    });

    // ───────────────── FETCH PERMISSIONS ─────────────────
    const fetchPermissions = async () => {

        try {

            const res = await axiosInstance.get(
                "/roles/permissions"
            );

            setPermissions(res.data.permissions || []);

        } catch (err) {

            console.error(err);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    // ───────────────── LOAD ROLE DATA ─────────────────
    useEffect(() => {

        if (role) {

            setForm({
                name: role.name || "",
                description: role.description || "",
                hierarchyLevel: role.hierarchyLevel || 99,
                dataScope: role.dataScope || "SELF",
                permissions: role.permissions || [],
            });

        } else {

            setForm({
                name: "",
                description: "",
                hierarchyLevel: 99,
                dataScope: "SELF",
                permissions: [],
            });
        }

    }, [role]);

    // ───────────────── GROUP PERMISSIONS ─────────────────
    const groupedPermissions = permissions.reduce(
        (groups, permission) => {

            const category = permission.split("_")[0];

            if (!groups[category]) {
                groups[category] = [];
            }

            groups[category].push(permission);

            return groups;

        },
        {}
    );

    if (!open) return null;

    // ───────────────── INPUT CHANGE ─────────────────
    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ───────────────── TOGGLE PERMISSION ─────────────────
    const togglePermission = (permission) => {

        setForm((prev) => {

            const exists =
                prev.permissions.includes(permission);

            if (exists) {

                return {
                    ...prev,
                    permissions: prev.permissions.filter(
                        (p) => p !== permission
                    ),
                };
            }

            return {
                ...prev,
                permissions: [
                    ...prev.permissions,
                    permission,
                ],
            };
        });
    };

    // ───────────────── TOGGLE GROUP ─────────────────
    const toggleGroupPermissions = (
        groupPermissions,
        selectAll
    ) => {

        setForm((prev) => {

            let updatedPermissions = [
                ...prev.permissions,
            ];

            if (selectAll) {

                groupPermissions.forEach((permission) => {

                    if (
                        !updatedPermissions.includes(permission)
                    ) {

                        updatedPermissions.push(permission);
                    }
                });

            } else {

                updatedPermissions =
                    updatedPermissions.filter(
                        (permission) =>
                            !groupPermissions.includes(permission)
                    );
            }

            return {
                ...prev,
                permissions: updatedPermissions,
            };
        });
    };

    // ───────────────── SUBMIT ─────────────────
    const handleSubmit = async () => {

        if (!form.name.trim()) {
            return setError("Role name is required");
        }

        setLoading(true);
        setError("");

        try {

            const payload = {
                ...form,

                name: form.name
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, "_"),

                hierarchyLevel: Number(
                    form.hierarchyLevel
                ),
            };

            if (isEdit) {

                await axiosInstance.put(
                    `/roles/${role._id}`,
                    payload
                );

            } else {

                await axiosInstance.post(
                    "/roles",
                    payload
                );
            }

            onSuccess?.();

            onClose();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Something went wrong"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

            <div className="bg-white rounded-2xl w-full max-w-5xl shadow-xl max-h-[95vh] overflow-hidden flex flex-col">

                {/* HEADER */}
                <div className="flex items-center justify-between p-5 border-b">

                    <div>

                        <h2 className="text-2xl font-semibold text-gray-800">

                            {isEdit
                                ? "Edit Role"
                                : "Create Role"}

                        </h2>

                        <p className="text-sm text-gray-500 mt-1">

                            Manage role permissions,
                            hierarchy, and access scope.

                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>

                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {error && (

                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* BASIC INFO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* ROLE NAME */}
                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                disabled={role?.isSystemRole}
                                placeholder="Enter role name"
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />

                        </div>

                        {/* HIERARCHY */}
                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hierarchy Level
                            </label>

                            <input
                                type="number"
                                name="hierarchyLevel"
                                value={form.hierarchyLevel}
                                onChange={handleChange}
                                disabled={role?.isSystemRole}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />

                        </div>

                    </div>

                    {/* DESCRIPTION */}
                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Enter description"
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                    {/* DATA SCOPE */}
                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data Scope
                        </label>

                        <select
                            name="dataScope"
                            value={form.dataScope}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        >

                            <option value="SELF">
                                SELF
                            </option>

                            <option value="TEAM">
                                TEAM
                            </option>

                            <option value="BRANCH">
                                BRANCH
                            </option>

                            <option value="ORGANIZATION">
                                ORGANIZATION
                            </option>

                        </select>

                    </div>

                    {/* PERMISSIONS */}
                    <div>

                        <div className="flex items-center justify-between mb-5">

                            <div>

                                <h3 className="text-lg font-semibold text-gray-800">
                                    Permissions
                                </h3>

                                <p className="text-sm text-gray-500">
                                    Configure access controls for this role
                                </p>

                            </div>

                            <div className="text-sm text-gray-500">
                                {form.permissions.length} selected
                            </div>

                        </div>

                        {permissions.length === 0 ? (

                            <div className="border rounded-xl p-5 text-sm text-gray-500">
                                No permissions found
                            </div>

                        ) : (

                            <div className="space-y-5">

                                {Object.entries(groupedPermissions).map(
                                    ([group, perms]) => {

                                        const selectedCount =
                                            perms.filter((permission) =>
                                                form.permissions.includes(permission)
                                            ).length;

                                        return (

                                            <div
                                                key={group}
                                                className="border rounded-2xl p-5"
                                            >

                                                {/* GROUP HEADER */}
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">

                                                    <div>

                                                        <h4 className="text-lg font-semibold text-gray-800">
                                                            {group}
                                                        </h4>

                                                        <p className="text-sm text-gray-500">
                                                            {selectedCount} / {perms.length} selected
                                                        </p>

                                                    </div>

                                                    <div className="flex gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                toggleGroupPermissions(
                                                                    perms,
                                                                    true
                                                                )
                                                            }
                                                            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                                                        >
                                                            Select All
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                toggleGroupPermissions(
                                                                    perms,
                                                                    false
                                                                )
                                                            }
                                                            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                                                        >
                                                            Clear
                                                        </button>

                                                    </div>

                                                </div>

                                                {/* PERMISSION GRID */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

                                                    {perms.map((permission) => {

                                                        const checked =
                                                            form.permissions.includes(permission);

                                                        return (

                                                            <label
                                                                key={permission}
                                                                className={`flex items-center gap-3 text-sm cursor-pointer border rounded-xl px-4 py-3 transition ${checked
                                                                    ? "border-blue-500 bg-blue-50"
                                                                    : "hover:bg-gray-50"
                                                                    }`}
                                                            >

                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={() =>
                                                                        togglePermission(permission)
                                                                    }
                                                                />

                                                                <span className="text-gray-700">
                                                                    {permission}
                                                                </span>

                                                            </label>
                                                        );
                                                    })}

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        )}

                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 p-5 border-t bg-white">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
                    >

                        {loading
                            ? "Saving..."
                            : isEdit
                                ? "Update Role"
                                : "Create Role"}

                    </button>

                </div>

            </div>

        </div>
    );
}