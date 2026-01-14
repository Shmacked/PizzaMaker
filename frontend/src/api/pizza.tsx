import { apiFetch } from "./client";
import { getImageUrl } from "./images";

import type { Size } from "./sizes";
import type { Sauce } from "./sauces";
import type { Crust } from "./crusts";
import type { Topping } from "./toppings";

import { Modal } from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import clsx from "clsx";

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
    // State to track which pizza is currently selected
    const [selectedPizzaId, setSelectedPizzaId] = React.useState<number | null>(null);
    const [selectedPizza, setSelectedPizza] = React.useState<Pizza | null>(null);

    const handlePizzaHoverEnter = (pizza: Pizza) => {
        setSelectedPizzaId(pizza.id);
    };

    const handlePizzaHoverLeave = (pizza: Pizza) => {
        setSelectedPizzaId(null);
    };


    const handleMouseClick = (pizza: Pizza) => {
        setSelectedPizza(pizza);
        const modal = Modal.getOrCreateInstance(document.getElementById("pizzaModal") as HTMLElement);
        modal.show();
    };


    return (
        <>
            <div className="row row-cols-1 row-cols-md-auto g-3 justify-content-center">
                {pizzas.filter(p => p.is_available).map(p => (
                    <div className="col" key={p.id}>
                        <div className={clsx("card h-100 border border-2", {
                            "border-success": selectedPizzaId === p.id,
                            "border-light": selectedPizzaId !== p.id,
                        })} style={{ width: "18rem" }} key={p.id} onMouseEnter={() => handlePizzaHoverEnter(p)} onMouseLeave={() => handlePizzaHoverLeave(p)} onClick={() => handleMouseClick(p)}>
                            <img src={getImageUrl(p.image_url)} alt={p.name} className="card-img-top" style={{ height: "200px", objectFit: "cover" }} />
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

            <div className="modal modal-lg" id="pizzaModal">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{selectedPizza?.name}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body" style={{ backgroundImage: `url(${getImageUrl(selectedPizza?.image_url || "")})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundBlendMode: "overlay" }}>
                            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", padding: "10px", borderRadius: "10px" }}>
                                <b>Available Sizes:</b> <br />
                                <p>{selectedPizza?.sizes.map(s => s.size).join(", ")}</p>
                                <b>Toppings:</b> <br />
                                <p>{selectedPizza?.toppings.map(t => t.name).join(", ")}</p>
                                <b>Sauce:</b> <br />
                                <p>{selectedPizza?.sauce.name}</p>
                                <b>Crust:</b> <br />
                                <p>{selectedPizza?.crust.name}</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};
