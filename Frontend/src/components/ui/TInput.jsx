import React from "react";

// ─── TEXT INPUT ───────────────────────────────────────────────────────────────
// Standard styled text input. Accepts all native input props via {...props}.
// hasError — when true, applies a red background tint and border.
const TInput = ({ required, hasError, ...props }) => (
    <input
        type="text"
        required={required}
        {...props}
        className={`w-full rounded-lg border px-3 py-1.5 text-[13px] text-gray-800 focus:outline-none focus:ring-2 transition-all duration-150 ${
            hasError
                ? "border-red-400 bg-[#FFF5F5] placeholder-red-300 focus:ring-red-300 focus:border-red-400"
                : "bg-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
        }`}
        style={hasError ? {} : { borderColor: "#d1cdc7" }}
    />
);

export default TInput;