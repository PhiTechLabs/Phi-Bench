    import React, { useState, useEffect } from "react";
    import { useNavigate } from "react-router-dom";

    const Client = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const roleBase = `/${user?.role}`;

    // TODO: replace with API fetch — e.g. useEffect(() => axios.get('/api/clients').then(...), [])
    const [clients, setClients] = useState([]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
            <div>
            <h1 className="text-xl font-semibold text-gray-800">Clients</h1>
            <p className="text-xs text-gray-400 mt-0.5">
                {clients.length} {clients.length === 1 ? "client" : "clients"} total
            </p>
            </div>
            <button
            onClick={() => navigate(`${roleBase}/add-client`)}
            className="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white px-4 py-2 rounded-md text-sm shadow-sm transition-all duration-150 flex items-center gap-1.5"
            >
            <span className="text-base leading-none">+</span>
            Add Client
            </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Client
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Industry
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Location
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Account Manager
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Contact
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Created
                </th>
                </tr>
            </thead>
            <tbody>
                {clients.length === 0 ? (
                <tr>
                    <td colSpan="6" className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">🏢</span>
                        <p className="text-sm font-medium text-gray-500">No clients yet</p>
                        <p className="text-xs text-gray-400">Add your first client to get started</p>
                    </div>
                    </td>
                </tr>
                ) : (
                clients.map((client) => (
                    <tr
                    key={client._id}
                    onClick={() => navigate(`${roleBase}/client-list/${client._id}`)}
                    className="border-t border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors duration-100 group"
                    >
                    <td className="px-5 py-4 text-blue-700 font-medium group-hover:text-blue-800">
                        {client.clientName}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{client.industry || "—"}</td>
                    <td className="px-5 py-4 text-gray-600">{client.billingCity || "—"}</td>
                    <td className="px-5 py-4 text-gray-600">{client.accountManager || "—"}</td>
                    <td className="px-5 py-4 text-gray-600">{client.contactNumber || "—"}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                        {client.createdAt
                        ? new Date(client.createdAt).toLocaleDateString()
                        : "—"}
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

    export default Client;