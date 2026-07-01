// ─── CLIENT FORM VALIDATION ───────────────────────────────────────────────────
// Frontend-side validation. Catches obvious issues BEFORE hitting the API.
// Backend (express-validator) is the source of truth — this is just UX.
//
// Returns: { valid: boolean, errors: { fieldName: "error message", ... } }

export const validateClientForm = ({ formData, pocs }) => {
    const errors = {};

    // ─── REQUIRED CLIENT FIELDS ──────────────────────────────────────────────
    if (!formData.clientName?.trim()) {
        errors.clientName = "Client name is required";
    }
    if (!formData.contactNumber?.trim()) {
        errors.contactNumber = "Contact number is required";
    }
    if (!formData.industry?.trim()) {
        errors.industry = "Industry is required";
    }

    // ─── OPTIONAL URL FIELDS ─────────────────────────────────────────────────
    if (formData.website?.trim() && !isValidUrl(formData.website)) {
        errors.website = "Website must be a valid URL";
    }
    if (formData.linkedin?.trim() && !isValidUrl(formData.linkedin)) {
        errors.linkedin = "LinkedIn must be a valid URL";
    }

    // ─── POC VALIDATION (only if POCs are added) ─────────────────────────────
    pocs.forEach((poc, idx) => {
        const prefix = `poc_${idx}`;
        if (!poc.firstName?.trim()) {
            errors[`${prefix}_firstName`] = `POC ${idx + 1}: first name required`;
        }
        if (!poc.lastName?.trim()) {
            errors[`${prefix}_lastName`] = `POC ${idx + 1}: last name required`;
        }
        if (!poc.email?.trim()) {
            errors[`${prefix}_email`] = `POC ${idx + 1}: email required`;
        } else if (!isValidEmail(poc.email)) {
            errors[`${prefix}_email`] = `POC ${idx + 1}: invalid email`;
        }
        if (!poc.designation?.trim()) {
            errors[`${prefix}_designation`] = `POC ${idx + 1}: designation required`;
        }
        if (!poc.location?.trim()) {
            errors[`${prefix}_location`] = `POC ${idx + 1}: location required`;
        }
        if (poc.linkedin?.trim() && !isValidUrl(poc.linkedin)) {
            errors[`${prefix}_linkedin`] = `POC ${idx + 1}: invalid LinkedIn URL`;
        }
    });

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const isValidUrl = (str) => {
    try {
        // Allow URLs without explicit protocol (e.g. "example.com")
        const url = str.startsWith("http") ? str : `https://${str}`;
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const isValidEmail = (str) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());