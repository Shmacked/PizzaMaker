// api/crusts.ts
import { apiFetch } from "./client";

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