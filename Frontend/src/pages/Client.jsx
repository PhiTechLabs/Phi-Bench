    import React, { useState, useEffect } from "react";
    import { useNavigate } from "react-router-dom";

    const Client = () => {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const roleBase = `/${user?.role}`;

    const [showForm, setShowForm] = useState(false);
    const [client, setClient] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        website: "",
        industry: "",
        location: "",
        employees: "",
        linkedin: "",
        pocName: "",
        contact: "",
        email: "",
        designation: "",
    });

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("clients")) || [];
        setClient(saved);
    }, []);

    useEffect(() => {
        localStorage.setItem("clients", JSON.stringify(client));
    }, [client]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newClient = {
        id: Date.now(),
        createdAt: new Date().toLocaleString(),
        ...formData,
        };

        setClient([newClient, ...client]);
        setShowForm(false);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Clients</h1>

            <button
            onClick={() => setShowForm(true)}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm shadow"
            >
            + Add Client 
            </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">

            <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                <th className="px-5 py-3 text-left">Client</th>
                <th className="px-5 py-3 text-left">Industry</th>
                <th className="px-5 py-3 text-left">Location</th>
                <th className="px-5 py-3 text-left">POC</th>
                <th className="px-5 py-3 text-left">Contact</th>
                <th className="px-5 py-3 text-left">Created</th>
                </tr>
            </thead>

            <tbody>
                {client.length === 0 ? (
                <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400">
                    No clients yet
                    </td>
                </tr>
                ) : (
                client.map((client) => (
                    <tr
                    key={client.id}
                    onClick={() => navigate(`${roleBase}/client-list/${client.id}`)}
                    className="border-t hover:bg-gray-50 cursor-pointer transition"
                    >
                    <td className="px-5 py-4 text-blue-700 font-medium">
                        {client.name}
                    </td>
                    <td className="px-5 py-4">{client.industry}</td>
                    <td className="px-5 py-4">{client.location}</td>
                    <td className="px-5 py-4">{client.pocName}</td>
                    <td className="px-5 py-4">{client.contact}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                        {client.createdAt}
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>

        {/* ================= COMPACT FORM ================= */}
        {showForm && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">

            <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-5">

                <h2 className="text-lg font-semibold mb-4">Add New Client</h2>

                <form onSubmit={handleSubmit} className="space-y-5">

                {/* COMPANY */}
                <Section title="Company Details">
                    <Input label="Client Name" name="name" onChange={handleChange} />
                    <Input label="Website" name="website" onChange={handleChange} />
                    <Input label="Industry" name="industry" onChange={handleChange} />
                    <Input label="Location" name="location" onChange={handleChange} />
                    <Input label="Employees" name="employees" onChange={handleChange} />
                    <Input label="LinkedIn" name="linkedin" onChange={handleChange} />
                </Section>

                {/* POC */}
                <Section title="Point of Contact">
                    <Input label="Name" name="pocName" onChange={handleChange} />
                    <Input label="Contact" name="contact" onChange={handleChange} />
                    <Input label="Email" name="email" onChange={handleChange} />
                    <Input label="Designation" name="designation" onChange={handleChange} />
                </Section>

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
                    Save Client
                    </button>

                </div>

                </form>
            </div>
            </div>
        )}
        </div>
    );
    };

    /* SECTION */
    const Section = ({ title, children }) => (
    <div>
        <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase">
        {title}
        </h3>
        <div className="grid md:grid-cols-3 gap-3">{children}</div>
    </div>
    );

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

    export default Client;