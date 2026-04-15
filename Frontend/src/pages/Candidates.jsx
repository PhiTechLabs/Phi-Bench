    import React, { useState, useEffect } from "react";
    import CandidateForm from "./CandidateForm";
    import { useNavigate } from "react-router-dom";

    const Candidates = () => {
    const [showForm, setShowForm] = useState(false);
    const [candidates, setCandidates] = useState([]);
    
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        skill: "",
        search: "",
    });

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("candidates")) || [];
        setCandidates(saved);
    }, []);

    useEffect(() => {
        localStorage.setItem("candidates", JSON.stringify(candidates));
    }, [candidates]);

    // ✅ HANDLE SAVE FROM FORM
    const handleAddCandidate = (data) => {
    const newCandidate = {
    id: Date.now(),

    // full name
    name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),

    // initials
    initials: `${data.firstName?.[0] || ""}${data.lastName?.[0] || ""}`.toUpperCase(),

    // 👉 IMPORTANT: store ALL fields
    ...data,
    };

        setCandidates([newCandidate, ...candidates]);
        setShowForm(false);
    };

    const filtered = candidates.filter((c) => {
        return (
        (filters.skill === "" || c.skills?.includes(filters.skill)) &&
        (filters.search === "" ||
            c.name.toLowerCase().includes(filters.search.toLowerCase()))
        );
    });

    // ✅ SWITCH TO FORM
    if (showForm) {
        return (
        <CandidateForm
            setShowForm={setShowForm}
            onSave={handleAddCandidate}
        />
        );
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
            <div>
            <h1 className="text-2xl font-semibold">Candidates</h1>
            <p className="text-gray-500 text-sm">
                Manage and track candidate profiles
            </p>
            </div>

            <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
            + Add Candidate
            </button>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex gap-3 mb-6">
            <input
            placeholder="Search candidates..."
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border px-3 py-2 rounded-md text-sm w-full"
            />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">

            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Skills</th>
                <th className="px-5 py-3 text-left">Experience</th>
                <th className="px-5 py-3 text-left">Company</th>
                <th className="px-5 py-3 text-left">Notice Period</th>
                <th className="px-5 py-3 text-left">Status</th>
                </tr>
            </thead>

            <tbody>
                {filtered.length === 0 ? (
                <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400">
                    No candidates
                    </td>
                </tr>
                ) : (
                filtered.map((c) => (
                    <tr key={c.id} className="border-t hover:bg-gray-50">

                    <td className="px-5 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                        {c.initials}
                        </div>
    <span
    onClick={() => navigate(`/candidates/${c.id}`)}
    className="text-blue-700 font-medium cursor-pointer hover:underline"
    >
    {c.name}
    </span>
                    </td>

                    <td className="px-5 py-4">{c.skills}</td>
                    <td className="px-5 py-4">{c.experience}</td>
                    <td className="px-5 py-4">{c.company}</td>
                    <td className="px-5 py-4">{c.noticePeriod}</td>

                    <td className="px-5 py-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        {c.status}
                        </span>
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

    export default Candidates;