import React from "react";
import { apiFetch } from "./client";

export type ToppingCategory = {
    id: number;
    name: string;
    description: string;
};

export const getToppingCategories = async () => {
    return await apiFetch<ToppingCategory[]>("/pizza/get_pizza_topping_categories");
};

export const getToppingCategory = async(category_id: number) => {
    return await apiFetch<ToppingCategory>(`/pizza/get_pizza_topping_category/${category_id}`);
}

export const addToppingCategory = async(toppingCategory: ToppingCategory) => {
    return await apiFetch<ToppingCategory>(`/pizza/add_pizza_topping_category`, {
        method: "POST",
        body: JSON.stringify(toppingCategory),
    });
};

export const updateToppingCategory = async(category_id: number, toppingCategory: ToppingCategory) => {
    return await apiFetch<ToppingCategory>(`/pizza/update_pizza_topping_category/${category_id}`, {
        method: "PATCH",
        body: JSON.stringify(toppingCategory),
    });
};

export const deleteToppingCategory = async(category_id: number) => {
    return await apiFetch<ToppingCategory>(`/pizza/delete_pizza_topping_category/${category_id}`, {
        method: "DELETE",
    });
};

interface DisplayToppingCategoryProps {
    toppingCategory: ToppingCategory;
}

export const DisplayToppingCategory: React.FC<DisplayToppingCategoryProps> = ({ toppingCategory }) => {
    return (
        <>
            <h1>{toppingCategory.name}</h1>
            <ul>
                <li key={toppingCategory.id}>
                    {toppingCategory.description}
                </li>
            </ul>
        </>
    );
};
