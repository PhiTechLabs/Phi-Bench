    import React, { useState, useEffect } from "react";

    const Vendors = () => {
    const [showForm, setShowForm] = useState(false);
    const [vendors, setVendors] = useState([]);

    const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    contact: "",
    location: "",
    });

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("vendors")) || [];
        setVendors(saved);
    }, []);

    useEffect(() => {
        localStorage.setItem("vendors", JSON.stringify(vendors));
    }, [vendors]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newVendor = {
        id: Date.now(),
        ...formData,
        };

        setVendors([newVendor, ...vendors]);
        setShowForm(false);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-semibold">Vendors</h1>

            <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
            + Add Vendor
            </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">

            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Company</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Contact</th>
                <th className="px-5 py-3 text-left">Location</th>
                </tr>
            </thead>

            <tbody>
                {vendors.length === 0 ? (
                <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-400">
                    No vendors yet
                    </td>
                </tr>
                ) : (
                vendors.map((v) => (
                    <tr key={v.id} className="border-t">
                    <td className="px-5 py-4 text-blue-700">{v.name}</td>
                    <td className="px-5 py-4">{v.company}</td>
                    <td className="px-5 py-4">{v.email}</td>
                    <td className="px-5 py-4">{v.contact}</td>
                    <td className="px-5 py-4">{v.location}</td>
                    </tr>
                ))
                )}
            </tbody>

            </table>
        </div>

        {/* FORM MODAL */}
        {showForm && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center">

            <div className="bg-white w-full max-w-xl rounded-xl p-5 shadow-lg">

                <h2 className="text-lg font-semibold mb-4">
                Add Vendor
                </h2>

                <form onSubmit={handleSubmit} className="grid gap-3">

                <Input label="Name"      name="name"      value={formData.name}      onChange={handleChange} />
                <Input label="Company"   name="company"   value={formData.company}   onChange={handleChange} />
                <Input label="Email"     name="email"     value={formData.email}     onChange={handleChange} />
                <Input label="Contact"   name="contact"   value={formData.contact}   onChange={handleChange} />
                <Input label="Location"  name="location"  value={formData.location}  onChange={handleChange} />

                <div className="flex justify-end gap-2 mt-3">

                    <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="border px-3 py-1.5 rounded-md text-sm"
                    >
                    Cancel
                    </button>

                    <button className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm">
                    Save
                    </button>

                </div>

                </form>
            </div>
            </div>
        )}

        </div>
    );
    };

    /* INPUT COMPONENT */
    const Input = ({ label, ...props }) => (
        <div>
            <label className="text-xs text-gray-500 mb-1 block">{label}</label>
            <input
            {...props}
            value={props.value || ""}
            className="w-full border px-2 py-2 rounded-md text-sm"
            />
        </div>
    );

    export default Vendors;