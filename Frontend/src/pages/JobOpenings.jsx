    import React, { useState, useEffect } from "react";
    import { useNavigate } from "react-router-dom";

    const JobOpenings = () => {
    const navigate = useNavigate();

    const [showForm, setShowForm] = useState(false);
    const [jobs, setJobs] = useState([]);

    const [formData, setFormData] = useState({
        code: "",
        title: "",
        type: "",
        mode: "",
        budget: "",
        location: "",
        experience: "",
        description: "",
    });

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("jobs")) || [];
        setJobs(saved);
    }, []);

    useEffect(() => {
        localStorage.setItem("jobs", JSON.stringify(jobs));
    }, [jobs]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newJob = {
        id: Date.now(),
        createdAt: new Date().toLocaleString(),
        ...formData,
        };

        setJobs([newJob, ...jobs]);
        setShowForm(false);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
            Job Openings
            </h1>

            <button
            onClick={() => setShowForm(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm shadow"
            >
            + Post a Job
            </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">

            <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                <th className="px-5 py-3 text-left">Code</th>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Mode</th>
                <th className="px-5 py-3 text-left">Budget</th>
                <th className="px-5 py-3 text-left">Location</th>
                <th className="px-5 py-3 text-left">Experience</th>
                </tr>
            </thead>

            <tbody>
                {jobs.length === 0 ? (
                <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-400">
                    No jobs posted yet
                    </td>
                </tr>
                ) : (
                jobs.map((job) => (
                    <tr
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="border-t hover:bg-gray-50 cursor-pointer transition"
                    >
                    <td className="px-5 py-4 font-medium text-blue-700">
                        {job.code}
                    </td>
                    <td className="px-5 py-4">{job.title}</td>
                    <td className="px-5 py-4">{job.type}</td>
                    <td className="px-5 py-4">{job.mode}</td>
                    <td className="px-5 py-4">{job.budget}</td>
                    <td className="px-5 py-4">{job.location}</td>
                    <td className="px-5 py-4">{job.experience}</td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>

        {/* ================= COMPACT FORM ================= */}
        {showForm && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center">

            <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-5">

                <h2 className="text-lg font-semibold mb-4">
                Post a Job
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">

                {/* GRID */}
                <div className="grid md:grid-cols-3 gap-3">

                    <Input label="Job Code" name="code" onChange={handleChange} />
                    <Input label="Job Title" name="title" onChange={handleChange} />
                    <Input label="Job Type" name="type" onChange={handleChange} />
                    <Input label="Work Mode" name="mode" onChange={handleChange} />
                    <Input label="Budget" name="budget" onChange={handleChange} />
                    <Input label="Location" name="location" onChange={handleChange} />
                    <Input label="Experience" name="experience" onChange={handleChange} />

                </div>

                {/* DESCRIPTION */}
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                    Description
                    </label>
                    <textarea
                    name="description"
                    onChange={handleChange}
                    className="w-full border px-2 py-2 rounded-md text-sm"
                    rows={3}
                    />
                </div>

                {/* ACTION */}
                <div className="flex justify-end gap-2 pt-3 border-t">

                    <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-3 py-1.5 text-sm border rounded-md"
                    >
                    Cancel
                    </button>

                    <button className="bg-blue-700 text-white px-4 py-1.5 text-sm rounded-md">
                    Save Job
                    </button>

                </div>

                </form>
            </div>
            </div>
        )}

        </div>
    );
    };

    /* INPUT */
    const Input = ({ label, ...props }) => (
    <div>
        <label className="text-xs text-gray-500 mb-1 block">
        {label}
        </label>
        <input
        {...props}
        className="w-full border px-2 py-2 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
        />
    </div>
    );


    export default JobOpenings;