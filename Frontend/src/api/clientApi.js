import axiosInstance from "./axiosInstance";

// ─── CLIENT API CALLS ─────────────────────────────────────────────────────────
// All endpoints related to /api/clients live here.
// Components import from this file — they never call axios directly.

// ─── HELPER: normalize backend response shape ────────────────────────────────
// Backend returns { client, ... } or { clients, count } — extract & normalize.
// Also ensures `id` is always present (alias of `_id`).
const normalize = (c) => {
    if (!c) return c;
    return {
        ...c,
        id: c.id || c._id, // Mongoose virtual gives us `id`, but be defensive
    };
};

const normalizeMany = (arr = []) => arr.map(normalize);

export const createClient = async (payload) => {
    const { data } = await axiosInstance.post("/clients", payload);
    return normalize(data.client);
    
};

export const getAllClients = async () => {
    const { data } = await axiosInstance.get("/clients");
    // Backend returns { clients: [...], count: N }
    const clients = data.clients || data.data || data;
    return Array.isArray(clients) ? normalizeMany(clients) : [];
};

export const getClientById = async (id) => {
    const { data } = await axiosInstance.get(`/clients/${id}`);
    console.log("🔍 Raw API response:", data);
    
    // Extract client data - handle various response formats
    let clientData = data.client || data;
    
    // If client is nested again (Mongoose serialization issue)
    if (clientData && typeof clientData === 'object' && clientData.client) {
        clientData = clientData.client;
    }
    
    console.log("🔍 Extracted client data:", clientData);
    return normalize(clientData);
};

// Alias for consistency with other APIs
export const getClient = getClientById;

export const updateClient = async (id, payload) => {
    const { data } = await axiosInstance.put(`/clients/${id}`, payload);
    return normalize(data.client || data);
};

export const deleteClient = async (id) => {
    const { data } = await axiosInstance.delete(`/clients/${id}`);
    return data;
};