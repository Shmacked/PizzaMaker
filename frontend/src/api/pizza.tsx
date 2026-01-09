import { apiFetch } from "./client";
import type { Size } from "./sizes";
import type { Sauce } from "./sauces";
import type { Crust } from "./crusts";
import type { Topping } from "./toppings";
import React from "react";

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

// Payload types for creating/updating pizzas (matches backend PizzaCreate/PizzaUpdate schemas)
export type PizzaCreatePayload = {
    name: string;
    description?: string;
    image_url?: string;
    is_available: boolean;
    size_ids: number[];
    sauce_id: number;
    crust_id: number;
    topping_ids: number[];
};

export type PizzaUpdatePayload = {
    name?: string;
    description?: string;
    image_url?: string;
    is_available?: boolean;
    size_ids?: number[];
    sauce_id?: number;
    crust_id?: number;
    topping_ids?: number[];
};

export const getPizzas = async () => {
    return await apiFetch<Pizza[]>("/pizza/get_designer_pizzas");
};

export const getPizza = async (pizza_id: number) => {
    return await apiFetch<Pizza>(`/pizza/get_pizza/${pizza_id}`);
};

export const addPizza = async (pizza: PizzaCreatePayload) => {
    return await apiFetch<Pizza>(`/pizza/add_pizza`, {
        method: "POST",
        body: JSON.stringify(pizza),
    });
};

export const updatePizza = async (pizza_id: number, pizza: PizzaUpdatePayload) => {
    return await apiFetch<Pizza>(`/pizza/update_pizza/${pizza_id}`, {
        method: "PUT",
        body: JSON.stringify(pizza),
    });
};

export const deletePizza = async (pizza_id: number): Promise<void> => {
    await apiFetch<void>(`/pizza/delete_pizza/${pizza_id}`, {
        method: "DELETE",
    });
};


interface DisplayPizzasProps {
    pizzas: Pizza[];
}

export const DisplayPizzas: React.FC<DisplayPizzasProps> = ({ pizzas }) => {
    return (
        <>
            <div className="row row-cols-1 row-cols-md-auto g-3 justify-content-center">
                {pizzas.filter(p => p.is_available).map(p => (
                    <div className="col" key={p.id}>
                        <div className="card h-100" style={{ width: "18rem" }} key={p.id}>
                            <img src={p.image_url} alt={p.name} className="card-img-top" style={{ height: "200px", objectFit: "cover" }} />
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{p.name}</h5>
                                <p className="card-text">
                                    {p.description}
                                </p>
                                <div className="d-flex flex-row flex-wrap gap-2 mt-auto">
                                {p.sizes.map(s => (
                                        <span className="badge bg-primary" key={s.id}>
                                            {s.size} — ${(s.base_price + p.sauce.price + p.crust.price + p.toppings.reduce((sum, topping) => sum + topping.price, 0)).toFixed(2)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};
