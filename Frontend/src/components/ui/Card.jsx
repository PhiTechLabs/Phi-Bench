import React from "react";

// ─── CARD ─────────────────────────────────────────────────────────────────────
// A white rounded container with a section title and optional remove button.
// Used for every section in the form (Client Info, Address, POC, Attachment).
const Card = ({ title, children, onRemove }) => (
    <div
        className="rounded-2xl px-8 pt-6 pb-8 space-y-5"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e5e1db" }}
    >
        <div className="flex items-center gap-4 mb-2">
            <h2 className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                {title}
            </h2>
            <div className="flex-1 h-px" style={{ backgroundColor: "#e5e1db" }} />
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none ml-2 shrink-0"
                    title="Remove"
                >
                    ×
                </button>
            )}
        </div>
        {children}
    </div>
);

export default Card;