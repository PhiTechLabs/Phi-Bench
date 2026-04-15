    import React, { useState } from "react";

    const Settings = () => {
    const [company, setCompany] = useState(
        localStorage.getItem("company") || ""
    );

    const save = () => {
        localStorage.setItem("company", company);
        alert("Saved!");
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">

        <h1 className="text-2xl font-semibold mb-6">Settings</h1>

        <div className="bg-white p-6 rounded-xl shadow max-w-xl">

            <label className="text-sm text-gray-600 mb-1 block">
            Company Name
            </label>

            <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full border px-3 py-2 rounded-md mb-4"
            />

            <button
            onClick={save}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
            Save Settings
            </button>

        </div>

        </div>
    );
    };

    export default Settings;