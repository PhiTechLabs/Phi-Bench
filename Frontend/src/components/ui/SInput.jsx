import React from "react";

// ─── SELECT INPUT ─────────────────────────────────────────────────────────────
// Styled <select> with custom dropdown caret. `options` is an array of strings.
// hasError — when true, applies a red background tint and border.
const SInput = ({ options, placeholder, hasError, ...props }) => (
    <select
        {...props}
        className={`w-full rounded-lg border px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 transition-all cursor-pointer appearance-none ${
            hasError
                ? "border-red-400 bg-[#FFF5F5] text-gray-700 focus:ring-red-300 focus:border-red-400"
                : "bg-white text-gray-700 focus:ring-blue-500"
        }`}
        style={{
            ...(hasError ? {} : { borderColor: "#d1cdc7" }),
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
        }}
    >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
        ))}
    </select>
);

export default SInput;