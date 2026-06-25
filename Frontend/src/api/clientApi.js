import axiosInstance from "./axiosInstance";

// ─── CLIENT API CALLS ─────────────────────────────────────────────────────────
// All endpoints related to /api/clients live here.
// Components import from this file — they never call axios directly.

export const createClient = async (payload) => {

    console.log(
    "PAYLOAD DOCUMENTS:",
    payload.documents
);
    const form = new FormData();

    Object.keys(payload).forEach((key) => {

        if (
            key !== "locations" &&
            key !== "pocs" &&
            key !== "documents"
        ) {
            form.append(key, payload[key]);
        }
    });

    form.append(
        "locations",
        JSON.stringify(payload.locations || [])
    );

    form.append(
        "pocs",
        JSON.stringify(payload.pocs || [])
    );

    if (payload.documents?.length) {

        payload.documents.forEach((file) => {

            form.append(
                "documents",
                file
            );
        });
    }

    for (const pair of form.entries()) {
    console.log(pair[0], pair[1]);
}

    const { data } =
        await axiosInstance.post(
            "/clients",
            form,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
            }
        );

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

export const getClientDocumentUrl = async (clientId, documentId) => {
    const { data } = await axiosInstance.get(
        `/clients/${clientId}/documents/${documentId}`
    );

    return data;
};