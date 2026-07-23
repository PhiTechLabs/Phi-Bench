import TableView from "../models/Tableview.js";

// ───────────────────────────────────────────────────────────
// GET SAVED VIEWS FOR A TABLE (current user only)
// ───────────────────────────────────────────────────────────
export const getTableViews = async (req, res) => {
    try {
        const { tableKey } = req.params;

        if (!tableKey) {
            return res.status(400).json({ message: "tableKey is required" });
        }

        const doc = await TableView.findOne({
            userId: req.user.id,
            tableKey,
        });

        // No saved doc yet is normal (brand new user / brand new table) —
        // frontend falls back to its built-in "All Records" default.
        return res.status(200).json({
            views: doc?.views || null,
            activeViewId: doc?.activeViewId || null,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// ───────────────────────────────────────────────────────────
// SAVE (UPSERT) VIEWS FOR A TABLE (current user only)
// ───────────────────────────────────────────────────────────
// Body: { views: [...], activeViewId: "..." }
// This replaces the whole views array for that table — simplest possible
// contract, mirrors exactly what the frontend already keeps in memory, so
// there's no per-view create/rename/delete endpoint to keep in sync.
export const saveTableViews = async (req, res) => {
    try {
        const { tableKey } = req.params;
        const { views, activeViewId } = req.body;

        if (!tableKey) {
            return res.status(400).json({ message: "tableKey is required" });
        }

        if (!Array.isArray(views)) {
            return res.status(400).json({ message: "views must be an array" });
        }

        const doc = await TableView.findOneAndUpdate(
            { userId: req.user.id, tableKey },
            { $set: { views, activeViewId: activeViewId || "__all__" } },
            { new: true, upsert: true }
        );

        return res.status(200).json({
            views: doc.views,
            activeViewId: doc.activeViewId,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};