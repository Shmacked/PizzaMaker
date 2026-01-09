import { apiFetch } from "./client";
import React from "react";
import type { ToppingCategory } from "./topping_categories";

export type Topping = {
    id: number;
    name: string;
    price: number;
    categories: ToppingCategory[];
};

// Payloads used when creating/updating toppings
export type ToppingCreatePayload = {
    name: string;
    price: number;
    category_ids: number[];
};

export type ToppingUpdatePayload = {
    name?: string;
    price?: number;
    category_ids?: number[];
};

export const getToppings = async () => {
    return await apiFetch<Topping[]>("/pizza/get_pizza_toppings");
};

export const getTopping = async (topping_id: number) => {
    return await apiFetch<Topping>(`/pizza/get_pizza_topping/${topping_id}`);
};

export const addTopping = async (topping: ToppingCreatePayload) => {
    // Backend route is /pizza/add_topping
    return await apiFetch<Topping>(`/pizza/add_topping`, {
        method: "POST",
        body: JSON.stringify(topping),
    });
};

export const updateTopping = async (topping_id: number, topping: ToppingUpdatePayload) => {
    // Backend route is /pizza/update_topping (PATCH)
    return await apiFetch<Topping>(`/pizza/update_topping/${topping_id}`, {
        method: "PATCH",
        body: JSON.stringify(topping),
    });
};

export const deleteTopping = async (topping_id: number): Promise<void> => {
    // Backend route is /pizza/delete_topping (DELETE, 204)
    await apiFetch<void>(`/pizza/delete_topping/${topping_id}`, {
        method: "DELETE",
    });
};

interface DisplayToppingsProps {
    toppings: Topping[];
}

export const DisplayToppings: React.FC<DisplayToppingsProps> = ({ toppings }) => {
    // Split toppings into 3 columns
    const chunkSize = Math.ceil(toppings.length / 3);
    const columns = [
        toppings.slice(0, chunkSize),
        toppings.slice(chunkSize, chunkSize * 2),
        toppings.slice(chunkSize * 2)
    ];

    return (
        <>
            <h1>Toppings</h1>
            <div className="row">
                {columns.map((column, colIndex) => (
                    <div key={colIndex} className="col-md-4">
                        <ul className="list-group list-group-flush">
                            {column.map(t => (
                                <li className="list-group-item" key={t.id}>
                                    {t.name} - ${t.price.toFixed(2)}
                                    {t.categories.length > 0 && (
                                        <span> ({t.categories.map(c => c.name).join(", ")})</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </>
    );
};