    import React, { useState } from "react";
    import { Outlet, useNavigate } from "react-router-dom";
    import { FaTachometerAlt } from "react-icons/fa"; // add this
    import { FaBars } from "react-icons/fa";
    import {
    FaTachometerAlt,
    FaUsers,
    FaBriefcase,
    FaUserTie,
    FaHandshake,
    FaPaperPlane,
    FaBuilding,
    FaChartBar,
    FaCog,
    FaBars,   // ✅ add this
    } from "react-icons/fa";

    const Layout = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const menu = [
    { name: "Dashboard", path: "/home", icon: <FaTachometerAlt /> },
    { name: "Bench", path: "/bench", icon: <FaUsers /> },
    { name: "Jobs", path: "/jobs", icon: <FaBriefcase /> },
    { name: "Candidates", path: "/candidates", icon: <FaUsers /> },
    { name: "Submissions", path: "/submissions", icon: <FaPaperPlane /> },
    { name: "Interviews", path: "/interviews", icon: <FaUserTie /> },
    { name: "Clients", path: "/client", icon: <FaHandshake /> },
    { name: "Vendors", path: "/vendors", icon: <FaBuilding /> },
    { name: "Reports", path: "/reports", icon: <FaChartBar /> },
    { name: "Settings", path: "/settings", icon: <FaCog /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">

        {/* SIDEBAR */}
        <div className={`bg-blue-900 text-white w-64 p-5 hidden md:block`}>
            <h1 className="text-xl font-bold mb-8">PhiBench</h1>

    <ul className="space-y-3">
    {menu.map((item, i) => (
        <li
        key={i}
        onClick={() => navigate(item.path)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
        <span className="text-lg">{item.icon}</span>
        {item.name}
        </li>
    ))}
    </ul>
        </div>

        {/* MOBILE SIDEBAR */}
        {open && (
            <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
            <div className="bg-blue-900 w-64 h-full p-5 text-white">
                <h1 className="text-xl font-bold mb-6">PhiJobs</h1>

                {menu.map((item, i) => (
                <div
                    key={i}
                    onClick={() => {
                    navigate(item.path);
                    setOpen(false);
                    }}
                    className="p-2 rounded hover:bg-blue-700 cursor-pointer"
                >
                    {item.name}
                </div>
                ))}
            </div>
            </div>
        )}

        {/* MAIN CONTENT */}
        <div className="flex-1">

            {/* TOP BAR */}
            <div className="bg-white p-4 shadow flex justify-between items-center">

            <button
                onClick={() => setOpen(true)}
                className="md:hidden text-xl"
            >
                <FaBars />
            </button>

            <input
                placeholder="Search..."
                className="border px-3 py-2 rounded-lg w-1/2 hidden md:block"
            />

            <div className="text-sm font-medium">
                👤 Profile
            </div>
            </div>

            {/* PAGE CONTENT */}
            <div className="p-4">
            <Outlet />
            </div>

        </div>
        </div>
    );
    };

    export default Layout;