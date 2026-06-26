import React from "react";
import PocSection from "./PocSection";

// ─── POC LIST MANAGER ─────────────────────────────────────────────────────────
// Handles three states:
//   1. POC section hidden  → show "+ Add POC" button only
//   2. POC section visible → render all POC cards + "+ Add POC" button below
const PocList = ({
    pocs,
    showPocSection,
    onPocChange,
    onShowAndAddFirst,
    onAdd,
    onRemove,
}) => {
    // ─── INITIAL STATE: just the "Add POC" button ─────────────────────────────
    if (!showPocSection) {
        return (
            <div>
                <button
                    type="button"
                    onClick={onShowAndAddFirst}
                    className="flex items-center gap-2 text-sm font-medium text-blue-700 border border-blue-200 rounded-xl px-4 py-2 bg-white hover:bg-blue-50 transition-all duration-150"
                >
                    <span className="text-lg leading-none">+</span> Add POC
                </button>
            </div>
        );
    }

    // ─── EXPANDED STATE: render POCs + "Add another POC" button ───────────────
    return (
        <div className="space-y-4">
            {pocs.map((poc, idx) => (
                <PocSection
                    key={poc.id}
                    poc={poc}
                    index={idx}
                    totalCount={pocs.length}
                    onChange={onPocChange}
                    onRemove={onRemove}
                />
            ))}

            <button
                type="button"
                onClick={onAdd}
                className="flex items-center gap-2 text-sm font-medium text-blue-700 border border-blue-200 rounded-xl px-4 py-2 bg-white hover:bg-blue-50 transition-all duration-150"
            >
                <span className="text-lg leading-none">+</span> Add POC
            </button>
        </div>
    );
};

export default PocList;