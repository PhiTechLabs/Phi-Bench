// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
    const finalStatus = err.statusCode || 500;

    res.status(finalStatus).json({
        message: err.message || "Server error",
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};

// ─── 404 HANDLER (for unmatched routes) ──────────────────────────────────────
export const notFound = (req, res, next) => {
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};