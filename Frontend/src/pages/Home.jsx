    import React from "react";
    import { useNavigate } from "react-router-dom";
    import {
    FaBriefcase,
    FaUsers,
    FaUserTie,
    FaHandshake,
    } from "react-icons/fa";

    const Home = () => {
    const navigate = useNavigate();

    const stats = [
        { title: "Jobs", value: "-", icon: <FaBriefcase />, route: "/jobs" },
        { title: "Candidates", value: "-", icon: <FaUsers />, route: "/candidates" },
        { title: "Interviews", value: "-", icon: <FaUserTie />, route: "/interviews" },
        { title: "Clients", value: "-", icon: <FaHandshake />, route: "/clients" },
    ];

    return (
        <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Dashboard
            </h1>
            <p className="text-gray-500 text-sm">
            Overview of your recruitment pipeline
            </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {stats.map((item, index) => (
            <div
                key={index}
                onClick={() => navigate(item.route)}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition"
            >
                <div className="text-blue-700 text-xl">
                {item.icon}
                </div>

                <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <p className="text-lg font-semibold text-gray-800">
                    {item.value}
                </p>
                </div>
            </div>
            ))}

        </div>
        </div>
    );
    };

    export default Home;