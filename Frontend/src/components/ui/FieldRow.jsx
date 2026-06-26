import React from "react";

// ─── FIELD ROW ────────────────────────────────────────────────────────────────
// 2-column grid for paired fields, or 1-column when `single` is true.
const FieldRow = ({ children, single }) => (
    <div className={`grid gap-x-5 gap-y-3 ${single ? "grid-cols-1" : "grid-cols-2"}`}>
        {children}
    </div>
);

export default FieldRow;