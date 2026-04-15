import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


    const formatLabel = (key) => {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
    };



    const CandidateDetails = () => {
    const { id } = useParams();
    const [candidate, setCandidate] = useState(null);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("candidates")) || [];
        const found = data.find((c) => c.id === Number(id));
        setCandidate(found);
    }, [id]);

    if (!candidate) {
        return <div className="p-6">Candidate not found</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">

        {/* HEADER */}
        <div className="mb-6">
            <h1 className="text-2xl font-semibold">{candidate.name}</h1>
            <p className="text-gray-500 text-sm">
            Candidate Profile Details
            </p>
        </div>

        {/* CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

            <div className="grid md:grid-cols-2 gap-6">

    {Object.entries(candidate).map(([key, value]) => {
        if (key === "id" || key === "initials") return null;

        return (
        <Detail
            key={key}
            label={formatLabel(key)}
            value={value}
        />
        );
    })}

    </div>


        </div>

        </div>
    );
    };

    const Detail = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium">{value || "—"}</p>
    </div>
    );

    export default CandidateDetails;