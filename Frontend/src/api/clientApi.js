import axiosInstance from "./axiosInstance";

// ─── CLIENT API CALLS ─────────────────────────────────────────────────────────
// All endpoints related to /api/clients live here.
// Components import from this file — they never call axios directly.

export const createClient = async (payload) => {
    const { data } = await axiosInstance.post("/clients", payload);
    return data;
};

export const getAllClients = async () => {
    const { data } = await axiosInstance.get("/clients");
    return data;
};

export const getClientById = async (id) => {
    const { data } = await axiosInstance.get(`/clients/${id}`);
    return data;
};

export const updateClient = async (id, payload) => {
    const { data } = await axiosInstance.put(`/clients/${id}`, payload);
    return data;
};

export const deleteClient = async (id) => {
    const { data } = await axiosInstance.delete(`/clients/${id}`);
    return data;
};