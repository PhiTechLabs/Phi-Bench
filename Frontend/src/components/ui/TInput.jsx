import React from "react";

// ─── TEXT INPUT ───────────────────────────────────────────────────────────────
// Standard styled text input. Accepts all native input props via {...props}.
const TInput = ({ required, ...props }) => (
    <input
        type="text"
        required={required}
        {...props}
        className="w-full rounded-lg border px-3 py-1.5 text-[13px] text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
        style={{ borderColor: "#d1cdc7" }}
    />
);

export default TInput;