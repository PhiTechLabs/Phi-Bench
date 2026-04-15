    import React, { useState, useContext } from "react";
    import { useNavigate } from "react-router-dom";
    import { ClientContext } from "../context/ClientContext";

    const AddClient = () => {
    const navigate = useNavigate();
    const { client, setClient } = useContext(ClientContext);

    const [formData, setFormData] = useState({
        name: "",
        website: "",
        industry: "",
        location: "",
        pocName: "",
        contact: "",
        email: "",
        designation: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newClient = {
        id: Date.now(),
        createdAt: new Date(),
        ...formData,
        };

        setClient([...client, newClient]); // 🔥 IMPORTANT

        navigate("/client");
    };

    return (
        <div className="p-6">
        <h1>Add Client</h1>

        <form onSubmit={handleSubmit} className="space-y-4">

            <input name="name" onChange={handleChange} placeholder="Client Name" />
            <input name="website" onChange={handleChange} placeholder="Website" />
            <input name="industry" onChange={handleChange} placeholder="Industry" />
            <input name="location" onChange={handleChange} placeholder="Location" />

            <button className="bg-blue-700 text-white px-4 py-2">
            Save
            </button>

        </form>
        </div>
    );
    };

    export default AddClient;