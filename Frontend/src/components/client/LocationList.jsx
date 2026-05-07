import React from "react";
import LocationSection from "./LocationSection";

// ─── LOCATION LIST MANAGER ────────────────────────────────────────────────────
// Renders all location cards + the "Add Location" button.
const LocationList = ({ locations, onLocationChange, onAdd, onRemove }) => (
    <>
        {locations.map((loc, idx) => (
            <LocationSection
                key={loc.id}
                location={loc}
                index={idx}
                onChange={onLocationChange}
                onRemove={onRemove}
            />
        ))}

        <div>
            <button
                type="button"
                onClick={onAdd}
                className="flex items-center gap-2 text-sm font-medium text-blue-700 border border-blue-200 rounded-xl px-4 py-2 bg-white hover:bg-blue-50 transition-all duration-150"
            >
                <span className="text-lg leading-none">+</span> Add Location
            </button>
        </div>
    </>
);

export default LocationList;