import { useState } from "react";

// ─── DEFAULT SHAPES ───────────────────────────────────────────────────────────
// Factory functions so each new location/POC gets a unique frontend-only id.
const defaultLocation = () => ({
    id: Date.now() + Math.random(),
    street: "",
    city: "",
    province: "",
    code: "",
    country: "",
});

const defaultPOC = () => ({
    id: Date.now() + Math.random(),
    firstName: "",
    lastName: "",
    contact: "",
    email: "",
    designation: "",
    linkedin: "",
    location: "",
});

const defaultFormData = {
    clientName: "",
    parentClient: "",
    // countryCode: "Ind +91",
    contactNumber: "",
    website: "",
    accountManager: "",
    linkedin: "",
    industry: "",
    about: "",
    source: "",
};

// ─── CUSTOM HOOK: useClientForm ───────────────────────────────────────────────
// Centralizes ALL state and handlers for the AddClient page.
// The page component just consumes what this hook returns.
const useClientForm = () => {
    // ─── STATE ────────────────────────────────────────────────────────────────
    const [formData, setFormData] = useState(defaultFormData);
    const [locations, setLocations] = useState([defaultLocation()]);
    const [pocs, setPocs] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [showPocSection, setShowPocSection] = useState(false);

    // ─── CLIENT INFO HANDLERS ─────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ─── LOCATION HANDLERS ────────────────────────────────────────────────────
    const handleLocationChange = (id, e) => {
        const { name, value } = e.target;
        setLocations((prev) =>
            prev.map((loc) => (loc.id === id ? { ...loc, [name]: value } : loc))
        );
    };
    const addLocation = () => setLocations((prev) => [...prev, defaultLocation()]);
    const removeLocation = (id) =>
        setLocations((prev) => prev.filter((loc) => loc.id !== id));

    // ─── POC HANDLERS ─────────────────────────────────────────────────────────
    const handlePocChange = (id, e) => {
        const { name, value } = e.target;
        setPocs((prev) =>
            prev.map((p) => (p.id === id ? { ...p, [name]: value } : p))
        );
    };
    const showPocAndAddFirst = () => {
        setShowPocSection(true);
        setPocs((prev) => [...prev, defaultPOC()]);
    };
    const addPoc = () => setPocs((prev) => [...prev, defaultPOC()]);
    const removePoc = (id) => {
        const updated = pocs.filter((p) => p.id !== id);
        setPocs(updated);
        if (updated.length === 0) setShowPocSection(false);
    };

    // ─── DOCUMENT HANDLERS (Phase 2 — Cloudinary later) ──────────────────────
    const handleAddDocument = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setDocuments((prev) => [
            ...prev,
            { id: Date.now(), file, name: file.name },
        ]);
        e.target.value = ""; // reset input so same file can be re-selected
    };
    const removeDocument = (id) =>
        setDocuments((prev) => prev.filter((d) => d.id !== id));

    // ─── RESET (used after successful submit) ────────────────────────────────
    const resetForm = () => {
        setFormData(defaultFormData);
        setLocations([defaultLocation()]);
        setPocs([]);
        setDocuments([]);
        setShowPocSection(false);
    };

    // ─── BUILD CLEAN PAYLOAD FOR BACKEND ─────────────────────────────────────
    // Strips frontend-only `id` fields. Returns ready-to-send object.
    const buildPayload = () => {
        const stripIds = (arr) => arr.map(({ id, ...rest }) => rest);
        return {
            ...formData,
            locations: stripIds(locations),
            pocs: stripIds(pocs),
            // documents intentionally omitted — backend defaults to []
            // (they'll be uploaded separately when we add Cloudinary)
        };
    };

    // ─── EXPOSE EVERYTHING ───────────────────────────────────────────────────
    return {
        // state
        formData,
        locations,
        pocs,
        documents,
        showPocSection,

        // client info
        handleChange,

        // locations
        handleLocationChange,
        addLocation,
        removeLocation,

        // POCs
        handlePocChange,
        showPocAndAddFirst,
        addPoc,
        removePoc,

        // documents
        handleAddDocument,
        removeDocument,

        // utilities
        resetForm,
        buildPayload,
    };
};

export default useClientForm;