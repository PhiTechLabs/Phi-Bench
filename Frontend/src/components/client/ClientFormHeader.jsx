import React from "react";
import Btn from "../ui/Btn";

// ─── STICKY TOP BAR ───────────────────────────────────────────────────────────
// Title on the left, Cancel/Save buttons on the right.
const ClientFormHeader = ({ onCancel, onSave, submitting }) => (
    <div
        className="sticky top-0 z-10 px-8 py-3 flex items-center justify-between border-b"
        style={{ backgroundColor: "#ffffff", borderColor: "#e5e1db" }}
    >
        <h1 className="text-sm font-semibold text-gray-700 tracking-tight">
            Create Client
        </h1>
        <div className="flex items-center gap-2">
            <Btn onClick={onCancel} variant="ghost" disabled={submitting}>
                Cancel
            </Btn>
            <Btn onClick={onSave} variant="primary" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
            </Btn>
        </div>
    </div>
);

export default ClientFormHeader;