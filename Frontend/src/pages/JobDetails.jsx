    import React, { useEffect, useState } from "react";
    import { useParams, useNavigate } from "react-router-dom";
    import { getJobById } from "../api/jobsApi";
    import useRoleBase from "../hooks/useRoleBase";

    const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);

    const roleBase = useRoleBase();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // useEffect(() => {
    //     const data = JSON.parse(localStorage.getItem("jobs")) || [];
    //     const found = data.find((j) => j.id == id);
    //     setJob(found);
    // }, [id]);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getJobById(id);
                setJob(data);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch job details.");
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id]);


    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0]">
                <div className="text-[13px] text-[#9B9890]">
                    Loading job details...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0]">
                <div className="text-[13px] text-red-500">
                    {error}
                </div>
            </div>
        );
    }

    if (!job) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#F5F4F0] font-sans">

        {/* ════════ COMPACT TOP BAR ════════ */}
        <div className="border-b border-[#E8E6E0] bg-white">
        <div className="flex items-center justify-between px-4 py-2.5">

            <div className="flex min-w-0 items-center gap-3">
            <button
                onClick={() => navigate(`${roleBase}/jobs`)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E0DDD6] bg-white text-lg text-[#6B6860] transition hover:bg-[#F5F4F0]"
            >
                ←
            </button>

            <div className="min-w-0">
                <h1 className="truncate text-[16px] font-semibold leading-tight text-[#1C1B18]">
                {job.title}
                </h1>

                <p className="truncate text-[11px] text-[#9B9890]">
                {job.client || "—"}
                </p>
            </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
            <button className="flex h-8 items-center rounded-lg border border-[#E0DDD6] bg-white px-3 text-[11.5px] font-medium text-[#4A4845] hover:bg-[#F5F4F0]">
                Edit
            </button>

            <button className="flex h-8 items-center rounded-lg border border-[#FECACA] bg-white px-3 text-[11.5px] font-medium text-[#DC2626] hover:bg-[#FEF2F2]">
                Delete
            </button>
            </div>

        </div>
        </div>  
        {/* Compact Top Bar Ended */}

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
            {/* <div className="grid md:grid-cols-2 gap-6 text-sm">

            <Detail label="Job Type" value={job.jobType} />
            <Detail label="Location" value={job.city} />
            <Detail label="Salary / Rate" value={job.salary} />
            <Detail label="Experience" value={job.experience} />
            {/* <Detail label="Budget" value={job.budget} /> */}

            {/* </div> */}

            {/* DESCRIPTION */}
            {/* <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">
                Job Description
            </h2>
            <p className="text-gray-600 leading-relaxed">
                {job.description || "No description provided"}
            </p>
            </div> */}

            <div className="w-full bg-white">
            <div className="px-4 py-4">

                {/* Position Info */}
                <Section title="Position Info">
                <Detail label="Client" value={job.client} />
                <Detail label="Status" value={job.status} />
                <Detail label="Job Type" value={job.jobType} />
                <Detail label="Experience" value={job.experience} />
                <Detail label="Salary / Rate" value={job.salary} />
                <Detail label="Industry" value={job.industry} />
                </Section>

                {/* Assignment */}
                <Section title="Assignment">
                <Detail label="Recruiter" value={job.recruiter} />
                <Detail label="Account Manager" value={job.manager} />
                <Detail label="Contact" value={job.contact} />
                </Section>

                {/* Location */}
                <Section title="Location">
                <Detail label="City" value={job.city} />
                <Detail label="Country" value={job.country} />
                </Section>

                {/* Timeline */}
                <Section title="Timeline">
                <Detail
                    label="Date Opened"
                    value={
                    job.dateOpened
                        ? new Date(job.dateOpened).toLocaleDateString()
                        : "—"
                    }
                />

                <Detail
                    label="Target Date"
                    value={
                    job.targetDate
                        ? new Date(job.targetDate).toLocaleDateString()
                        : "—"
                    }
                />

                <Detail
                    label="Created"
                    value={
                    job.createdAt
                        ? new Date(job.createdAt).toLocaleDateString()
                        : "—"
                    }
                />
                </Section>

                {/* Skills */}
                <Section title="Skills">
                <div className="col-span-full flex flex-wrap gap-2">
                    {(job.skills || "")
                    .split(",")
                    .filter(Boolean)
                    .map((skill, i) => (
                        <span
                        key={i}
                        className="rounded-full border border-[#D6DAF0] bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-medium text-[#1D4ED8]"
                        >
                        {skill.trim()}
                        </span>
                    ))}
                </div>
                </Section>

                {/* Description */}
                <Section title="Job Description">
                <div className="col-span-full text-[13px] leading-6 text-[#4A4845] whitespace-pre-wrap">
                    {job.description || "No description provided"}
                </div>
                </Section>

            </div>
            </div>

        </div>
        </div>
    );
    };

    const Detail = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-[10.5px] font-medium uppercase tracking-wide text-[#9B9890]">
        {label}
        </span>

        <span className="text-[12.5px] font-medium text-[#1C1B18]">
        {value || "—"}
        </span>
    </div>
    );
    const Section = ({ title, children }) => (
    <div className="mb-5 last:mb-0">
        <h2 className="mb-2 text-[13px] font-semibold text-[#1C1B18]">
        {title}
        </h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
        {children}
        </div>
    </div>
    );

    export default JobDetails;