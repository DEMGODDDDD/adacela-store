import { useRef, useState } from "react";
import { Alert, Box, Snackbar } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import api, {
  getApiAuthToken,
  setApiAuthToken,
} from "../api/axios";
import AdminLoginDialog from "../components/AdminLoginDialog";
import Header from "../components/Header";

export default function MainLayout({ onAddToCart, cartCount }) {
  const { pathname } = useLocation();
  const [notice, setNotice] = useState("");
  const [noticeSeverity, setNoticeSeverity] = useState("success");
  const [loginOpen, setLoginOpen] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(
    () => Boolean(getApiAuthToken())
  );
  const [productsRevision, setProductsRevision] = useState(0);
  const pendingAdminAction = useRef(null);

  const handleAddToCart = (product, buyNow = false) => {
    onAddToCart(product);
    setNoticeSeverity("success");
    setNotice(
      buyNow
        ? `${product.name} added to cart. Cart: ${cartCount + 1}. Checkout is not available in this demo yet.`
        : `${product.name} added to cart. Cart: ${cartCount + 1}.`
    );
  };

  const notify = (message, severity = "success") => {
    setNoticeSeverity(severity);
    setNotice(message);
  };

  const notifyProductsChanged = () => {
    setProductsRevision((revision) => revision + 1);
  };

  const requestAdminAccess = (action) => {
    if (adminAuthenticated && getApiAuthToken()) {
      action();
      return;
    }

    pendingAdminAction.current = action;
    setLoginOpen(true);
  };

  const handleAdminLogin = async (credentials) => {
    const response = await api.post("/auth/login", {
      ...credentials,
      device_name: "adacela-framework",
    });
    const { token, user } = response.data;

    if (!token || user?.role !== "admin") {
      throw new Error("An administrator account is required for product changes.");
    }

    setApiAuthToken(token);
    setAdminAuthenticated(true);
    pendingAdminAction.current?.();
    pendingAdminAction.current = null;
  };

  const handleLoginClose = () => {
    setLoginOpen(false);
    pendingAdminAction.current = null;
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Header
        overlay={pathname === "/"}
        light={pathname.startsWith("/products/")}
      />
      <Outlet
        context={{
          requestAdminAccess,
          notify,
          notifyProductsChanged,
          productsRevision,
          onAddToCart: (product) => handleAddToCart(product),
          onBuyNow: (product) => handleAddToCart(product, true),
        }}
      />
      <AdminLoginDialog
        open={loginOpen}
        onClose={handleLoginClose}
        onLogin={handleAdminLogin}
      />
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3000}
        onClose={() => setNotice("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setNotice("")} severity={noticeSeverity} variant="filled">
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  );
}