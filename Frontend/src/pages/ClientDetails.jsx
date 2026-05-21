import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAvatarProps } from "../utils/avatar";
import useRoleBase from "../hooks/useRoleBase";

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const roleBase = useRoleBase();
  const [client, setClient] = useState(null);

  useEffect(() => {
    // TODO: replace with API call once backend is ready
    const data = JSON.parse(localStorage.getItem("clients")) || [];
    const found = data.find((c) => c.id == id);
    setClient(found);
  }, [id]);

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0]">
        <div className="text-[13px] text-[#9B9890]">Loading…</div>
      </div>
    );
  }

  const { initials, bgColor, textColor } = getAvatarProps(client.name || client.clientName);

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      
      {/* ════════ COMPACT TOP BAR ════════ */}
      <div className="border-b border-[#E8E6E0] bg-white">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => navigate(`${roleBase}/client-list`)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E0DDD6] bg-white text-lg text-[#6B6860] transition hover:bg-[#F5F4F0]"
              title="Back to clients"
            >
              ←
            </button>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold"
              style={{ backgroundColor: bgColor, color: textColor }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[16px] font-semibold leading-tight text-[#1C1B18]">
                {client.name || client.clientName}
              </h1>
              <p className="truncate text-[11px] text-[#9B9890]">
                {client.industry || "—"}
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

      {/* ════════ CONTENT (EDGE-TO-EDGE) ════════ */}
      <div className="w-full bg-white">
        <div className="px-4 py-4">
          
          {/* Company Info */}
          <Section title="Company Info">
            <Detail label="Website" value={client.website} />
            <Detail label="Industry" value={client.industry} />
            <Detail label="Location" value={client.location || client.primaryCity} />
            <Detail label="Employees" value={client.employees} />
            <Detail label="GST Number" value={client.gstNumber} /> 
            <Detail label="PAN Number" value={client.panNumber} />
          </Section>

          {/* Point of Contact */}
          <Section title="Point of Contact">
            <Detail label="Name" value={client.pocName || client.primaryPoc} />
            <Detail label="Contact" value={client.contact || client.primaryPhone} />
            <Detail label="Email" value={client.email || client.primaryEmail} />
            <Detail label="Designation" value={client.designation} />
          </Section>

          {/* Account Details */}
          <Section title="Account Details">
            <Detail label="Account Manager" value={client.accountManager} />
            <Detail label="Status" value={client.status} />
            <Detail label="Created" value={client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "—"} />
            <Detail label="Last Updated" value={client.updatedAt ? new Date(client.updatedAt).toLocaleDateString() : "—"} />
          </Section>

        </div>
      </div>

    </div>
  );
};

/* ──────────────────── HELPERS ──────────────────── */

const Section = ({ title, children }) => (
  <div className="mb-5 last:mb-0">
    <h2 className="mb-2 text-[13px] font-semibold text-[#1C1B18]">{title}</h2>
    <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  </div>
);

const Detail = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10.5px] font-medium uppercase tracking-wide text-[#9B9890]">{label}</span>
    <span className="text-[12.5px] font-medium text-[#1C1B18]">{value || "—"}</span>
  </div>
);

export default ClientDetails
