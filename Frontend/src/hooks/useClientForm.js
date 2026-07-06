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
// Centralizes ALL state and handlers for the AddClient/EditClient pages.
// Pass `initialData` (a client object from the API) to pre-populate for editing.
const useClientForm = (initialData = null) => {
    // ─── STATE ────────────────────────────────────────────────────────────────
    const [formData, setFormData] = useState(() => {
        if (!initialData) return defaultFormData;
        return {
            clientName:    initialData.clientName    || "",
            parentClient:  initialData.parentClient  || "",
            contactNumber: initialData.contactNumber || "",
            website:       initialData.website       || "",
            accountManager:initialData.accountManager|| "",
            linkedin:      initialData.linkedin      || "",
            industry:      initialData.industry      || "",
            about:         initialData.about         || "",
            source:        initialData.source        || "",
        };
    });

    const [locations, setLocations] = useState(() => {
        if (initialData?.locations?.length) {
            return initialData.locations.map((loc) => ({
                ...loc,
                id: loc._id || loc.id || Date.now() + Math.random(),
            }));
        }
        return [defaultLocation()];
    });

    const [pocs, setPocs] = useState(() => {
        if (initialData?.pocs?.length) {
            return initialData.pocs.map((p) => ({
                ...p,
                id: p._id || p.id || Date.now() + Math.random(),
            }));
        }
        return [];
    });

    const [documents, setDocuments] = useState([]);
    const [showPocSection, setShowPocSection] = useState(
        () => !!(initialData?.pocs?.length)
    );

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

    // ─── SEED FORM (for edit mode) ────────────────────────────────────────────
    // Called once after fetching an existing client to populate all state.
    // Simpler than lazy initializers since it runs after mount regardless of
    // when data arrives — no race conditions with the loading state.
    const seedForm = (client) => {
        if (!client) return;
        setFormData({
            clientName:     client.clientName     || "",
            parentClient:   client.parentClient   || "",
            contactNumber:  client.contactNumber  || "",
            website:        client.website        || "",
            accountManager: client.accountManager || "",
            linkedin:       client.linkedin       || "",
            industry:       client.industry       || "",
            about:          client.about          || "",
            source:         client.source         || "",
        });
        if (client.locations?.length) {
            setLocations(client.locations.map((loc) => ({
                ...loc,
                id: loc._id || loc.id || Date.now() + Math.random(),
            })));
        }
        if (client.pocs?.length) {
            setPocs(client.pocs.map((p) => ({
                ...p,
                id: p._id || p.id || Date.now() + Math.random(),
            })));
            setShowPocSection(true);
        }
    };

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
    const stripIds = (arr) =>
        arr.map(({ id, ...rest }) => rest);

    return {
        ...formData,
        locations: stripIds(locations),
        pocs: stripIds(pocs),

        documents: documents.map(
            (doc) => doc.file
        ),
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
        seedForm,
        buildPayload,
    };
};

export default useClientForm;