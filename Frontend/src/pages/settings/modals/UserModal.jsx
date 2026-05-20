import React, { useState } from "react";
import axiosInstance from "../../../api/axiosInstance";

import {
    FaEye,
    FaEyeSlash,
} from "react-icons/fa";

import { RxCross2 } from "react-icons/rx";

export default function UserModal(){

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
    
}

