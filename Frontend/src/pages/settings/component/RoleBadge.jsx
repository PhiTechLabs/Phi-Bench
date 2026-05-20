import React from "react";

export default function RoleBadge({ role }) {

    const styles = {
        superAdmin: "bg-purple-100 text-purple-700",
        admin: "bg-blue-100 text-blue-700",
        client: "bg-green-100 text-green-700",
    };

    const labels = {
        superAdmin: "Super Admin",
        admin: "Admin",
        client: "Client",
    };

    return (

        <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                styles[role] || "bg-gray-100 text-gray-600"
            }`}
        >
            {labels[role] || role}
        </span>

    );

}