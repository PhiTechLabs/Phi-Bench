import React from "react";

// ─── SELECT INPUT ─────────────────────────────────────────────────────────────
// Styled <select> with custom dropdown caret. `options` is an array of strings.
const SInput = ({ options, placeholder, ...props }) => (
    <select
        {...props}
        className="w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
        style={{
            borderColor: "#d1cdc7",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
        }}
    >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
        ))}
    </select>
);

export default SInput;