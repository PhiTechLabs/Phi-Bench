// ─── API ERROR UTILITIES ──────────────────────────────────────────────────────
// Used by form-owning pages (Candidates.jsx, JobOpenings.jsx, AddClient.jsx)
// to extract structured error info from failed API calls, then feed it into
// ErrorModal rather than window.alert().

// Returns { title, message, errors } ready to pass straight into ErrorModal.
//   title   — short summary for the modal heading
//   message — plain fallback string (used when there are no field-level errors)
//   errors  — array of { field, message } from backend express-validator output
export const parseApiError = (err, fallbackTitle = "Something went wrong") => {
    const data = err?.response?.data;

    if (!data) {
        return {
            title:   fallbackTitle,
            message: err?.message || "An unexpected error occurred.",
            errors:  [],
        };
    }

    const errors = Array.isArray(data.errors) ? data.errors : [];
    const message = data.message || "An unexpected error occurred.";

    return { title: fallbackTitle, message, errors };
};