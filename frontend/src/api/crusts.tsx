// api/crusts.ts
import { apiFetch } from "./client";
import React from "react";

export type Crust = {
    id: number;
    name: string;
    price: number;
};

export const getCrusts = async () => {
  return await apiFetch<Crust[]>("/pizza/get_pizza_crusts");
};

export const getCrust = async (id: number) => {
  return await apiFetch<Crust>(`/pizza/get_pizza_crust/${id}`);
};

export const addCrust = async (crust: Crust) => {
    return await apiFetch<Crust>(`/pizza/add_crust`, {
        method: "POST",
        body: JSON.stringify(crust),
    });
};

export const updateCrust = async (crust_id: number, crust: Crust) => {
    return await apiFetch<Crust>(`/pizza/update_crust/${crust_id}`, {
        method: "PATCH",
        body: JSON.stringify(crust),
    });
};

export const deleteCrust = async (crust_id: number) => {
    return await apiFetch<Crust>(`/pizza/delete_crust/${crust_id}`, {
        method: "DELETE",
    });
};


interface DisplayCrustsProps {
  crusts: Crust[];
}

export const DisplayCrusts: React.FC<DisplayCrustsProps> = ({ crusts }) => {
  return (
      <>
          <h1 style={{ fontFamily: 'Monterey', fontSize: '4rem', textDecoration: 'underline' }}>Crusts</h1>
          <ul className="list-group list-group-flush">
              {crusts.map(c => (
                  <li className="list-group-item" key={c.id}>
                      {c.name} — ${c.price}
                  </li>
              ))}
          </ul>
      </>
  );
};