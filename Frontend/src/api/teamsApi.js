import axiosInstance from "./axiosInstance";

export const getTeams = async () => {
    const res = await axiosInstance.get("/teams");
    return res.data;
};

export const createTeam = async (data) => {
    const res = await axiosInstance.post("/teams", data);
    return res.data;
};

export const updateTeam = async (id, data) => {
    const res = await axiosInstance.put(
        `/teams/${id}`,
        data
    );

    return res.data;
};

export const deleteTeam = async (id) => {
    const res = await axiosInstance.delete(
        `/teams/${id}`
    );

    return res.data;
};