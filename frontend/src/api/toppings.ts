import { apiFetch } from "./client";

export type Topping = {
    id: number;
    name: string;
    price: number;
};

export const getToppings = async () => {
    return await apiFetch<Topping[]>("/pizza/get_pizza_toppings");
};

export const getTopping = async(topping_id: number) => {
    return await apiFetch<Topping>(`/pizza/get_pizza_topping/${topping_id}`);
}

export const addTopping = async (topping: Topping) => {
    return await apiFetch<Topping>(`/pizza/add_topping`, {
        method: "POST",
        body: JSON.stringify(topping),
    });
};

export const updateTopping = async (topping_id: number, topping: Topping) => {
    return await apiFetch<Topping>(`/pizza/update_topping/${topping_id}`, {
        method: "PATCH",
        body: JSON.stringify(topping),
    });
};

export const deleteTopping = async (topping_id: number) => {
    return await apiFetch<Topping>(`/pizza/delete_topping/${topping_id}`);
};