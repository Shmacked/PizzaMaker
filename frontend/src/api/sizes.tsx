import { apiFetch } from "./client";
import React from "react";

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

export const deleteSize = async (size_id: number): Promise<void> => {
    await apiFetch<void>(`/pizza/delete_size/${size_id}`, {
        method: "DELETE"
    });
};


interface DisplaySizesProps {
    sizes: Size[];
}

export const DisplaySizes: React.FC<DisplaySizesProps> = ({ sizes }) => {
    return (
        <>
            <h1>Sizes</h1>
            <ul className="list-group list-group-flush">
                {sizes.map(s => (
                    <li className="list-group-item" key={s.id}>
                        {s.size} — ${s.base_price}
                    </li>
                ))}
            </ul>
        </>
    );
};
