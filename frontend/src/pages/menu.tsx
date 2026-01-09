import { useEffect, useState } from "react";
import { getSizes, DisplaySizes, type Size } from "../api/sizes";
import { getSauces, DisplaySauces, type Sauce } from "../api/sauces";
import { getCrusts, DisplayCrusts, type Crust } from "../api/crusts";
import { getToppings, DisplayToppings, type Topping } from "../api/toppings";
import { getPizzas, DisplayPizzas, type Pizza } from "../api/pizza";
import PizzaNav from "../page_related/pizza_navbar.tsx";
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
      <div>
        <PizzaNav />
      </div>
      <div className="container-fluid">
        <div className="row d-flex justify-content-center my-4">
          <DisplayPizzas pizzas={pizzas} />
        </div>
        <div className="row d-flex justify-content-center my-4">
          <div className="col">
            <DisplaySizes sizes={sizes} />
          </div>
          <div className="col">
            <DisplaySauces sauces={sauces} />
          </div>
          <div className="col">
            <DisplayCrusts crusts={crusts} />
          </div>
        </div>
        <div className="row d-flex justify-content-center my-4">
          <DisplayToppings toppings={toppings} />
        </div>
      </div>
    </div>
  );
}

export default App;
