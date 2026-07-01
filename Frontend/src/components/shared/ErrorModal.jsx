import React from "react";

// ─── ICON ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

const icons = {
    x:       "M6 18L18 6M6 6l12 12",
    warning: "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
};

// ─── ERROR MODAL ──────────────────────────────────────────────────────────────
// Replaces browser alert() for form submission failures.
// Props:
//   title   — short heading, e.g. "Failed to create candidate"
//   message — a plain string (shown when there are no field-level errors)
//   errors  — optional array of { field, message } objects from the backend
//             validator (these show as a bullet list of specific field errors)
//   onClose — called when user dismisses
const ErrorModal = ({ title, message, errors = [], onClose }) => {
    // Deduplicate errors in case the same message comes back more than once
    const uniqueErrors = errors.filter(
        (e, i, arr) =>
            arr.findIndex((x) => x.message === e.message) === i
    );

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-start gap-4 px-6 pt-5 pb-4 border-b border-[#FEE2E2] bg-[#FFF7F7]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEE2E2] text-[#DC2626]">
                        <Icon d={icons.warning} size={20} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                        <h2 className="text-[15px] font-bold text-[#991B1B]">{title}</h2>
                        {message && !uniqueErrors.length && (
                            <p className="mt-1 text-[13px] text-[#B91C1C]">{message}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#DC2626]/60 hover:bg-[#FEE2E2] hover:text-[#DC2626] transition"
                    >
                        <Icon d={icons.x} size={16} />
                    </button>
                </div>

                {/* Body — field-level errors */}
                {uniqueErrors.length > 0 && (
                    <div className="px-6 py-4">
                        <p className="mb-3 text-[12.5px] font-semibold text-[#64748B] uppercase tracking-wide">
                            Please fix the following:
                        </p>
                        <ul className="space-y-2">
                            {uniqueErrors.map((e, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />
                                    <span className="text-[13px] text-[#1E293B]">
                                        {e.message}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-[#F1F5F9]">
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-[#DC2626] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#B91C1C] transition"
                    >
                        Got it
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ErrorModal;