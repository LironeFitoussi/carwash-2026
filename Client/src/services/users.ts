import type { IUser } from "@/types";
import api from "./api";


export const getUsers = async () => {
    const {data} = await api.get("/api/users");
    return data.data;
};

export const getCurrentUser = async () => {
    const {data} = await api.get(`/api/auth/me`);
    return data;
};

export const createUser = async (payload: IUser) => {
    const {data} = await api.post("/api/users", payload);
    return data;
};
