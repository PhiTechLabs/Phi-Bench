import React from "react";

// Colour map — keys are snake_case (how roles are stored in DB)
const STYLES = {
    super_admin: "bg-purple-100 text-purple-700",
    admin:       "bg-blue-100   text-blue-700",
    team_lead:   "bg-indigo-100 text-indigo-700",
    recruiter:   "bg-cyan-100   text-cyan-700",
    client:      "bg-green-100  text-green-700",
};

// Human-readable display names
const LABELS = {
    super_admin: "Super Admin",
    admin:       "Admin",
    team_lead:   "Team Lead",
    recruiter:   "Recruiter",
    client:      "Client",
};

export default function RoleBadge({ role }) {

    if (!role) return null;

    // Normalise to snake_case so both "teamLead" and "team_lead" match
    const key = role
        .replace(/([A-Z])/g, "_$1")   // camelCase → snake_case
        .toLowerCase()
        .replace(/^_/, "");            // strip leading underscore if any

    const style = STYLES[key] || "bg-gray-100 text-gray-600";
    const label = LABELS[key] || role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>
            {label}
        </span>
    );
}