import React from "react";

// ─── FIELD ────────────────────────────────────────────────────────────────────
// Renders a label (with optional red asterisk for required fields) and slots
// the actual input control on the right.
const Field = ({ label, required, children }) => (
    <div className="flex items-start gap-2.5">
        <label
            className="text-[12.5px] text-gray-500 pt-2 text-right leading-tight shrink-0"
            style={{ minWidth: "96px" }}
        >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="flex-1">{children}</div>
    </div>
);

export default Field;