import mongoose from "mongoose";

// ─── TABLE VIEW ────────────────────────────────────────────────────────────
// Stores a user's saved DataTable "views" (filters, search, sort) AND their
// column layout (visible/ordered columns + widths) server-side, per table,
// per user — so switching devices/browsers shows the same saved views
// instead of the localStorage-only behaviour this replaces.
//
// One document per (userId, tableKey) pair. "views" is stored as a plain
// array of Mixed objects rather than a strict sub-schema because the shape
// mirrors whatever the frontend's useDataTable hook captures (filters,
// dateFilters, search, sort, visibleKeys, columnWidths) and that shape is
// allowed to evolve without needing a migration here.
const tableViewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Matches the frontend's `storageKey` prop, e.g. "submissions_table_v2"
        tableKey: {
            type: String,
            required: true,
        },

        views: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },

        activeViewId: {
            type: String,
            default: "__all__",
        },
    },
    { timestamps: true }
);

tableViewSchema.index({ userId: 1, tableKey: 1 }, { unique: true });

export default mongoose.model("TableView", tableViewSchema);