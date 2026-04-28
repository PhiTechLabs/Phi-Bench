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
    FaBars, 
    } from "react-icons/fa";
    import { RxCross2 } from "react-icons/rx";

    const Layout = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const [profileOpen, setProfileOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));

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
            <div className="bg-white p-4 shadow flex justify-between items-cente relative z-10">

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

            <div
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-3 bg-white px-3 py-2 mr-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100"
                >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {user?.username?.charAt(0)?.toUpperCase()}
                </div>

                {/* Username */}
                <div className="hidden sm:flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-gray-800">
                    {user?.username}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                    {user?.role}
                    </span>
                </div>
                </div>
            </div>

            {/* PAGE CONTENT */}
            <div className="p-4">
            <Outlet />
            </div>

            {profileOpen && (
                <>
                    {/* Overlay */}
                    <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                    onClick={() => setProfileOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="fixed top-0 right-0 h-full w-40 md:w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300">

                    {/* Header */}
                    <div className="bg-blue-600 text-white p-6 ">
                        <div className="flex justify-between items-center">
                        <h2 className=" text-lg text-shadow-lg  md:text-lg font-semibold">Profile</h2>
                        <button onClick={() => setProfileOpen(false)}>
                            <RxCross2 className="text-2xl" />
                        </button>
                        </div>

                        {/* Avatar */}
                        <div className="mt-6 flex items-center gap-2 md:gap-4">
                        <div 
                        className=" 
                        w-14 h-9 px-2
                        md:w-14 md:h-14 
                        md:rounded-full rounded-xl 
                        bg-white 
                        text-blue-600 
                        flex items-center justify-center 
                        text-sm 
                        md:text-xl 
                        font-bold 
                        shadow-md
                        ">
                            {user?.username?.charAt(0)?.toUpperCase()}
                        </div>

                        <div>
                            <p className="font-semibold text-sm md:text-lg">{user?.username}</p>
                            <p className="text-sm opacity-80 capitalize">{user?.role}</p>
                        </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="md:p-6 p-4 space-y-4">

                        {/* Info Card */}
                        <div className="bg-gray-50 p-3 md:p-4 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-500">Username</p>
                        <p className="md:font-medium text-sm font-semibold text-gray-800">{user?.username}</p>
                        </div>

                        <div className="bg-gray-50 p-3 md:p-4 rounded-xl shadow-sm">
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="md:font-medium text-sm font-semibold text-gray-800 capitalize">{user?.role}</p>
                        </div>

                        {/* Divider */}
                        <div className="border-t pt-4"></div>

                        {/* Actions */}
                        <button className="md:w-full w-[80%] ml-3  bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition">
                        Logout
                        </button>

                    </div>
                    </div>
                </>
)}


                

        </div>
        </div>
    );
    };

    export default Layout;