import { Routes, Route } from "react-router-dom";
import Menu from "./pages/menu";
import Sizes from "./pages/sizes";
import Sauces from "./pages/sauces";
import Crusts from "./pages/crusts";
import Toppings from "./pages/toppings";
import ToppingCategories from "./pages/topping_categories";
import Pizzas from "./pages/pizzas";
import NotFound from "./pages/not_found";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path="/sizes" element={<Sizes />} />
      <Route path="/sauces" element={<Sauces />} />
      <Route path="/crusts" element={<Crusts />} />
      <Route path="/topping_categories" element={<ToppingCategories />} />
      <Route path="/toppings" element={<Toppings />} />
      <Route path="/pizza_builder" element={<Pizzas />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
