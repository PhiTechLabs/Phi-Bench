    import React, { useState, useEffect } from "react";

    const Bench = () => {
    const [resources, setResources] = useState([]);

    // ✅ Load from CANDIDATES instead of bench
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("candidates")) || [];

        // Map candidates → bench format
        const mapped = saved.map((c) => ({
        id: c.id,
        name: c.name,
        skills: c.skills,
        experience: c.experience,
        location: c.location || "N/A",
        benchDays: c.benchDays || "0",
        status: c.status || "Available",
        }));

        setResources(mapped);
    }, []);

    // ✅ Update status
    const updateStatus = (id, newStatus) => {
        const updated = resources.map((r) =>
        r.id === id ? { ...r, status: newStatus } : r
        );

        setResources(updated);

        // ALSO update in candidates (important)
        const candidates = JSON.parse(localStorage.getItem("candidates")) || [];

        const updatedCandidates = candidates.map((c) =>
        c.id === id ? { ...c, status: newStatus } : c
        );

        localStorage.setItem("candidates", JSON.stringify(updatedCandidates));
    };

    // Stats
    const available = resources.filter(r => r.status === "Available").length;
    const idle = resources.filter(r => r.status === "Idle").length;
    const screening = resources.filter(r => r.status === "Screening").length;
    const interview = resources.filter(r => r.status === "Interview").length;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">

        {/* HEADER */}
        <div className="mb-6">
            <h1 className="text-2xl font-semibold">Bench Resources</h1>
            <p className="text-gray-500 text-sm">
            Auto-synced from Candidates
            </p>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card title="Available" value={available} />
            <Card title="Idle" value={idle} />
            <Card title="Screening" value={screening} />
            <Card title="Interview" value={interview} />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Skills</th>
                <th className="px-5 py-3 text-left">Experience</th>
                <th className="px-5 py-3 text-left">Location</th>
                <th className="px-5 py-3 text-left">Bench Days</th>
                <th className="px-5 py-3 text-left">Status</th>
                </tr>
            </thead>

            <tbody>
                {resources.length === 0 ? (
                <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400">
                    No candidates available
                    </td>
                </tr>
                ) : (
                resources.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50">

                    <td className="px-5 py-4 font-medium text-blue-700">
                        {r.name}
                    </td>

                    <td className="px-5 py-4">{r.skills}</td>
                    <td className="px-5 py-4">{r.experience}</td>
                    <td className="px-5 py-4">{r.location}</td>
                    <td className="px-5 py-4">{r.benchDays}</td>

                    {/* ✅ STATUS EDITABLE */}
                    <td className="px-5 py-4 flex items-center gap-2">

                        <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-gray-200 bg-gray-50 text-xs"
                        >
                        <option>Available</option>
                        <option>Idle</option>
                        <option>Screening</option>
                        <option>Interview</option>
                        </select>

                        <span className="text-gray-400 text-xs">✏️</span>
                    </td>

                    </tr>
                ))
                )}
            </tbody>

            </table>
        </div>

        </div>
    );
    };

    const Card = ({ title, value }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-xl font-semibold">{value}</h2>
    </div>
    );

    export default Bench;
