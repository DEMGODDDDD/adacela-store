import { useState } from "react";
import { Alert, Box, Snackbar } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import ProductFormDialog from "../components/ProductFormDialog";

export default function MainLayout({ onCreate, onAddToCart, cartCount }) {
  const { pathname } = useLocation();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const handleCreate = (values) => {
    onCreate(values);
    setAddDialogOpen(false);
    setNotice("Product added successfully.");
  };

  const handleAddToCart = (product, buyNow = false) => {
    onAddToCart(product);
    setNotice(
      buyNow
        ? `${product.name} added to cart. Cart: ${cartCount + 1}. Checkout is not available in this demo yet.`
        : `${product.name} added to cart. Cart: ${cartCount + 1}.`
    );
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Header
        overlay={pathname === "/"}
        light={pathname.startsWith("/products/")}
      />
      <Outlet
        context={{
          onAddProduct: () => setAddDialogOpen(true),
          onAddToCart: (product) => handleAddToCart(product),
          onBuyNow: (product) => handleAddToCart(product, true),
        }}
      />
      <ProductFormDialog
        open={addDialogOpen}
        product={null}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleCreate}
      />
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3000}
        onClose={() => setNotice("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setNotice("")} severity="success" variant="filled">
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  );
}