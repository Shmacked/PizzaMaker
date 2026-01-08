import { apiFetch } from "./client";
import type { Size } from "./sizes";
import type { Sauce } from "./sauces";
import type { Crust } from "./crusts";
import type { Topping } from "./toppings";

export type Pizza = {
    id: number;
    name: string;
    description: string;
    image_url: string;
    is_available: boolean;
    sizes: Array<Size>;
    sauce: Sauce;
    crust: Crust;
    toppings: Array<Topping>;
};


export const getPizzas = async () => {
    return await apiFetch<Pizza[]>("/pizza/get_designer_pizzas");
};

export const getPizza = async (pizza_id: number) => {
    return await apiFetch<Pizza>(`/pizza/get_pizza/${pizza_id}`);
};

export const addPizza = async (pizza: Pizza) => {
    return await apiFetch<Pizza>(`/pizza/add_pizza`, {
        method: "POST",
        body: JSON.stringify(pizza),
    });
};

export const updatePizza = async (pizza_id: number, pizza: Pizza) => {
    return await apiFetch<Pizza>(`/pizza/update_pizza/${pizza_id}`, {
        method: "PUT",
        body: JSON.stringify(pizza),
    });
};

export const deletePizza = async (pizza_id: number) => {
    return await apiFetch<Pizza>(`/pizza/delete_pizza/${pizza_id}`);
};