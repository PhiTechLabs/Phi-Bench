import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaArrowLeft,
    FaShieldAlt,
} from "react-icons/fa";

import RoleBadge from "./settings/component/RoleBadge";
import { getCurrentUser } from "../utils/auth";
// const getLoggedUser = () =>
//     JSON.parse(localStorage.getItem("user"));

export default function Setup() {

    const navigate = useNavigate();

    const loggedUser = getCurrentUser();


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

                <h1 className="text-lg font-semibold text-gray-800">
                    Account Setup
                </h1>

            </div>

            <div className="flex max-w-6xl mx-auto mt-6 gap-6 px-4 pb-10">

                {/* ── SIDEBAR ── */}
                <aside className="w-56 shrink-0">

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* User Info */}
                        <div className="p-4 bg-blue-700 text-white">

                            <div className="w-12 h-12 rounded-full bg-white text-blue-700 flex items-center justify-center text-xl font-bold mb-2">

                                {loggedUser?.username
                                    ?.charAt(0)
                                    ?.toUpperCase()}

                            </div>

                            <p className="font-semibold text-sm truncate">
                                {loggedUser?.username}
                            </p>

                            <p className="text-xs text-blue-200 capitalize">
                                {loggedUser?.role}
                            </p>

                        </div>

                        {/* ONLY MY PROFILE */}
                        <nav className="p-2">

                            <div
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-blue-50 text-blue-700"
                            >

                                <span className="text-blue-600">
                                    <FaUser />
                                </span>

                                My Profile

                            </div>

                        </nav>

                    </div>

                </aside>

                {/* ── MAIN CONTENT ── */}
                <main className="flex-1">

                    <div className="space-y-4">

                        {/* PROFILE CARD */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                            <h2 className="text-base font-semibold text-gray-800 mb-5">
                                Profile Information
                            </h2>

                            <div className="flex items-center gap-5 mb-6">

                                <div className="w-20 h-20 rounded-full bg-blue-700 text-white flex items-center justify-center text-3xl font-bold shadow">

                                    {loggedUser?.username
                                        ?.charAt(0)
                                        ?.toUpperCase()}

                                </div>

                                <div>

                                    <p className="text-xl font-semibold text-gray-800">
                                        {loggedUser?.username}
                                    </p>

                                    <RoleBadge role={loggedUser?.role} />

                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div className="bg-gray-50 rounded-xl p-4">

                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                        Username
                                    </p>

                                    <p className="text-gray-800 font-medium">
                                        {loggedUser?.username}
                                    </p>

                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">

                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                        Role
                                    </p>

                                    <p className="text-gray-800 font-medium capitalize">
                                        {loggedUser?.role}
                                    </p>

                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">

                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                        Email
                                    </p>

                                    <p className="text-gray-800 font-medium truncate">
                                        {loggedUser?.email || "—"}
                                    </p>

                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">

                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                        Session
                                    </p>

                                    <div className="flex items-center gap-2">

                                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />

                                        <p className="text-gray-800 font-medium text-sm">
                                            Active
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* SECURITY CARD */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                            <div className="flex items-center gap-3 mb-3">

                                <FaShieldAlt className="text-blue-600" />

                                <h2 className="text-base font-semibold text-gray-800">
                                    Security
                                </h2>

                            </div>

                            <p className="text-sm text-gray-500">

                                Your session is secured with an{" "}

                                <span className="font-medium text-gray-700">
                                    HttpOnly JWT cookie
                                </span>

                                . It expires in 24 hours and cannot be accessed
                                by browser scripts.

                            </p>

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
}