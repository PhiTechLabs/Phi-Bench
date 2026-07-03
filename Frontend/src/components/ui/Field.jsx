import React from "react";

// ─── FIELD ────────────────────────────────────────────────────────────────────
// Renders a label (with optional red asterisk for required fields) and slots
// the actual input control on the right.
// error — if provided, highlights the border and shows a red message below.
const Field = ({ label, required, error, wrapperRef, children }) => (
    <div ref={wrapperRef} className="flex items-start gap-2.5">
        <label
            className="text-[12.5px] text-gray-500 pt-2 text-right leading-tight shrink-0"
            style={{ minWidth: "96px" }}
        >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="flex-1">
            <div className={error ? "ring-1 ring-red-400 rounded-lg" : ""}>
                {children}
            </div>
            {error && (
                <p className="mt-1 text-[11.5px] text-red-500 leading-tight">{error}</p>
            )}
        </div>
    </div>
);

export default Field;