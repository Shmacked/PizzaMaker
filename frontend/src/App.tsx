import { Routes, Route } from "react-router-dom";
import Menu from "./pages/menu";
import NotFound from "./pages/not_found";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Menu />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
