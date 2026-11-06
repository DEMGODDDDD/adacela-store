import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((current) => [...current, product]);
  };

  return (
    <Routes>
      <Route
        element={
          <MainLayout
            onAddToCart={addToCart}
            cartCount={cart.length}
          />
        }
      >
        <Route
          path="/"
          element={<ProductListPage />}
        />
        <Route
          path="/products/:id"
          element={<ProductDetailsPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}