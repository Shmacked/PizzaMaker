import { apiFetch } from "./client";

export type Size = {
    id: number;
    size: string;
    base_price: number;
};


export const getSizes = async () => {
    return await apiFetch<Size[]>("/pizza/get_pizza_sizes");
};

export const getSize = async (size_id: number) => {
    return await apiFetch<Size>(`/pizza/get_pizza_size/${size_id}`);
};

export const addSize = async (size: Size) => {
    return await apiFetch<Size>(`/pizza/add_size`, {
        method: "POST",
        body: JSON.stringify(size),
    });
};

export const updateSize = async (size_id: number, size: Size) => {
    return await apiFetch<Size>(`/pizza/update_size/${size_id}`, {
        method: "PUT",
        body: JSON.stringify(size),
    });
};

export const deleteSize = async (size_id: number) => {
    return await apiFetch<Size>(`/pizza/delete_size/${size_id}`);
};
