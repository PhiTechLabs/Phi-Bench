import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("clients")) || [];
    const found = data.find((c) => c.id == id);
    setClient(found);
  }, [id]);

  if (!client) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <button
        onClick={() => navigate("/clients")}
        className="mb-4 text-blue-700 text-sm"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">

        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          {client.name}
        </h1>

        <Section title="Company Info">
          <Detail label="Website" value={client.website} />
          <Detail label="Industry" value={client.industry} />
          <Detail label="Location" value={client.location} />
          <Detail label="Employees" value={client.employees} />
        </Section>

        <Section title="Point of Contact">
          <Detail label="Name" value={client.pocName} />
          <Detail label="Contact" value={client.contact} />
          <Detail label="Email" value={client.email} />
          <Detail label="Designation" value={client.designation} />
        </Section>

      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    <div className="grid md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
);

export default ClientDetails;