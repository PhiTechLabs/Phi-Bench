import React from "react";

// ─── BUTTON ───────────────────────────────────────────────────────────────────
// Two variants: "primary" (blue) and "ghost" (outlined). Accepts `disabled`
// for use with submit-in-progress states.
const Btn = ({ children, onClick, variant, disabled, type = "button" }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className="px-4 py-1.5 text-sm rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        style={
            variant === "primary"
                ? { backgroundColor: "#1d4ed8", color: "#fff", border: "none" }
                : { backgroundColor: "transparent", color: "#6b7280", border: "1px solid #d1cdc7" }
        }
        onMouseEnter={(e) => {
            if (disabled) return;
            e.currentTarget.style.backgroundColor =
                variant === "primary" ? "#1e40af" : "#f5f3f0";
        }}
        onMouseLeave={(e) => {
            if (disabled) return;
            e.currentTarget.style.backgroundColor =
                variant === "primary" ? "#1d4ed8" : "transparent";
        }}
    >
        {children}
    </button>
);

export default Btn;