import React from "react";
import Btn from "../ui/Btn";
import BackButton from "../../reusable/BackButton";

// ─── GENERIC FORM HEADER ──────────────────────────────────────────────────────
// Sticky top bar used across all entity creation pages
// (AddClient, AddCandidate, AddJob, etc.).
//
// Props:
//   title         → string shown as the heading (e.g. "Create Client")
//   onCancel      → handler for the Cancel button
//   onSave        → handler for the Save button
//   submitting    → when true: disables buttons, shows "Saving..." label
//   saveLabel     → optional override for the save button text (defaults to "Save")
//   savingLabel   → optional override for the saving-state label (defaults to "Saving...")
const FormHeader = ({
    title,
    onCancel,
    onSave,
    submitting = false,
    saveLabel = "Save",
    savingLabel = "Saving...",
}) => (
    <div
        className="sticky top-0 z-10 px-8 py-3 flex items-center justify-between border-b"
        style={{ backgroundColor: "#ffffff", borderColor: "#e5e1db" }}
    >
        <div className="flex items-center gap-4">
        <BackButton/>
        <h1 className="text-sm font-semibold text-gray-700 tracking-tight">
            {title}
        </h1>
        </div>
        <div className="flex items-center gap-2">
            <Btn onClick={onCancel} variant="ghost" disabled={submitting}>
                Cancel
            </Btn>
            <Btn onClick={onSave} variant="primary" disabled={submitting}>
                {submitting ? savingLabel : saveLabel}
            </Btn>
        </div>
    </div>
);

export default FormHeader;