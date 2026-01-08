import { apiFetch } from "./client";

export type Sauce = {
    id: number;
    name: string;
    price: number;
};

export const getSauces = async () => {
    return await apiFetch<Sauce[]>("/pizza/get_pizza_sauces");
};

export const getSauce = async (sauce_id: number) => {
    return await apiFetch<Sauce>(`/pizza/get_pizza_sauce/${sauce_id}`);
};

export const addSauce = async (sauce: Sauce) => {
    return await apiFetch<Sauce>(`/pizza/add_sauce`, {
        method: "POST",
        body: JSON.stringify(sauce),
    });
};

export const updateSauce = async (sauce_id: number, sauce: Sauce) => {
    return await apiFetch<Sauce>(`/pizza/update_sauce/${sauce_id}`, {
        method: "PATCH",
        body: JSON.stringify(sauce),
    });
};

export const deleteSauce = async (sauce_id: number) => {
    return await apiFetch<Sauce>(`/pizza/delete_sauce/${sauce_id}`);
};
