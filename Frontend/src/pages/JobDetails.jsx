    import React, { useEffect, useState } from "react";
    import { useParams, useNavigate } from "react-router-dom";

    const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("jobs")) || [];
        const found = data.find((j) => j.id == id);
        setJob(found);
    }, [id]);

    if (!job) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">

        {/* BACK */}
        <button
            onClick={() => navigate("/jobs")}
            className="mb-4 text-blue-700 text-sm"
        >
            ← Back to Jobs
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6">

            {/* HEADER */}
            <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
                {job.title}
            </h1>
            <p className="text-gray-500 text-sm">
                Job Code: {job.code}
            </p>
            </div>

            {/* MAIN GRID */}
            <div className="grid md:grid-cols-2 gap-6 text-sm">

            <Detail label="Job Type" value={job.type} />
            <Detail label="Work Mode" value={job.mode} />
            <Detail label="Location" value={job.location} />
            <Detail label="Experience" value={job.experience} />
            <Detail label="Budget" value={job.budget} />

            </div>

            {/* DESCRIPTION */}
            <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">
                Job Description
            </h2>
            <p className="text-gray-600 leading-relaxed">
                {job.description || "No description provided"}
            </p>
            </div>

        </div>
        </div>
    );
    };

    const Detail = ({ label, value }) => (
    <div>
        <p className="text-gray-500">{label}</p>
        <p className="font-medium">{value || "-"}</p>
    </div>
    );

    export default JobDetails;