import { useEffect, useState } from "react";
import type { Size } from "../api/sizes";
import { getSizes } from "../api/sizes";
import type { Sauce } from "../api/sauces";
import { getSauces } from "../api/sauces";
import type { Crust } from "../api/crusts";
import { getCrusts } from "../api/crusts";
import type { Topping } from "../api/toppings";
import { getToppings } from "../api/toppings";
import type { Pizza } from "../api/pizza";
import { getPizzas } from "../api/pizza";
import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";


function App() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [sauces, setSauces] = useState<Sauce[]>([]);
  const [crusts, setCrusts] = useState<Crust[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);

  useEffect(() => {
    getPizzas()
      .then(setPizzas)
      .catch(console.error);
  }, []);

  useEffect(() => {
    getSizes()
      .then(setSizes)
      .catch(console.error);
  }, []);

  useEffect(() => {
    getSauces()
      .then(setSauces)
      .catch(console.error);
  }, []);

  useEffect(() => {
    getCrusts()
      .then(setCrusts)
      .catch(console.error);
  }, []);

  useEffect(() => {
    getToppings()
      .then(setToppings)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>Pizzas</h1>
      <ul>
        {pizzas.map(p => (
          <li key={p.id}>
            {p.name}
            <ul>
              <li>
                {p.description}
              </li>
              <li>
                {p.image_url}
              </li>
              <li>
                {p.is_available ? "Available" : "Not Available"}
              </li>
              {p.sizes.map(s => (
                <li key={s.id}>
                  {s.size} — ${s.base_price + p.sauce.price + p.crust.price + p.toppings.reduce((sum, topping) => sum + topping.price, 0)}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <h1>Sizes</h1>
      <ul>
        {sizes.map(s => (
          <li key={s.id}>
            {s.size} — ${s.base_price}
          </li>
        ))}
      </ul>
      <h1>Sauces</h1>
      <ul>
        {sauces.map(s => (
          <li key={s.id}>
            {s.name} — ${s.price}
          </li>
        ))}
      </ul>
      <h1>Crusts</h1>
      <ul>
        {crusts.map(c => (
          <li key={c.id}>
            {c.name} — ${c.price}
          </li>
        ))}
      </ul>
      <h1>Toppings</h1>
      <ul>
        {toppings.map(t => (
          <li key={t.id}>
            {t.name} — ${t.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
