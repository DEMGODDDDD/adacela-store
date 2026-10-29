import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";
import initialProducts from "./data/initialProducts";

export default function App() {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);

  const createProduct = (values) => {
    setProducts((current) => {
      const nextId = current.length
        ? Math.max(...current.map((product) => Number(product.id))) + 1
        : 1;
      return [...current, { ...values, id: nextId }];
    });
  };

  const updateProduct = (id, values) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, ...values } : product
      )
    );
  };

  const removeProduct = (id) => {
    setProducts((current) => current.filter((product) => product.id !== id));
  };

  const addToCart = (product) => {
    setCart((current) => [...current, product]);
  };

  return (
    <Routes>
      <Route
        element={
          <MainLayout
            onCreate={createProduct}
            onAddToCart={addToCart}
            cartCount={cart.length}
          />
        }
      >
        <Route
          path="/"
          element={
            <ProductListPage
              products={products}
              onUpdate={updateProduct}
              onRemove={removeProduct}
            />
          }
        />
        <Route
          path="/products/:id"
          element={<ProductDetailsPage products={products} />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}