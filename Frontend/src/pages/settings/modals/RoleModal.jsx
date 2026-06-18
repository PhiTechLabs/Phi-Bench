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
                permissions: role.permissions || [],
            });

        } else {

            setForm({
                name: "",
                description: "",
                hierarchyLevel: 99,
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

        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[70vh] overflow-hidden flex flex-col">   

                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                {/* HEADER */}
                <div className="flex items-center rounded-t-xl justify-between px-6 py-5 border-b bg-linear-to-r from-blue-50 to-indigo-50">

                    <div>

                        <h2 className="text-xl font-bold text-gray-800">

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
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {error && (

                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* BASIC INFO */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* ROLE NAME */}
                        <div>

                            <label className="block text-md font-medium text-gray-700 mb-1">
                                Role Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                disabled={role?.isSystemRole}
                                placeholder="Enter role name"
                                className="w-full border rounded-lg px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />

                        </div>

                        {/* HIERARCHY */}
                        <div>

                            <label className="block text-md font-medium text-gray-700 mb-1">
                                Hierarchy Level
                            </label>

                            <input
                                type="number"
                                name="hierarchyLevel"
                                value={form.hierarchyLevel}
                                onChange={handleChange}
                                disabled={role?.isSystemRole}
                                className="w-full border rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />

                        </div>

                    </div>

                    {/* DESCRIPTION */}
                    <div>

                        <label className="block text-md font-medium text-gray-700 mb-2">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Enter description"
                            className="w-full text-sm rounded-xl border h-18 border-gray-200 px-2 py-2 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                        />

                    </div>

                    {/* DATA SCOPE */}
                    {/* <div>

                        <label className="block text-md font-medium text-gray-700 mb-1">
                            Data Scope
                        </label>

                        <select
                            onChange={handleChange}
                            className="w-[40%]  rounded-xl border text-sm border-gray-200 px-3 py-2 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
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

                    </div> */}


                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 px-6 py-3 border-t bg-gray-50">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
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

        </div>
    );
}