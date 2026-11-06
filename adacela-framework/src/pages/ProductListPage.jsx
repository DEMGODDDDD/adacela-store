import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useOutletContext } from "react-router-dom";

import api, { clearApiAuthToken } from "../api/axios";
import { normalizeProduct } from "../api/products";
import initialProducts from "../data/initialProducts";
import ProductCard from "../components/ProductCard";
import ProductFormDialog from "../components/ProductFormDialog";
import DeleteProductDialog from "../components/DeleteProductDialog";
import heroBackground from "../assets/hero-section.jpg";

async function fetchProductList(signal) {
  const response = await api.get("/products", { signal });
  const responseData = response.data;
  const productList = Array.isArray(responseData)
    ? responseData
    : responseData?.data;

  if (!Array.isArray(productList)) {
    throw new Error("The API returned an invalid product list.");
  }

  return productList.map(normalizeProduct);
}

function getApiErrorMessage(error, fallback) {
  const validationErrors = error.response?.data?.errors;
  if (validationErrors) {
    return Object.values(validationErrors).flat().join(" ");
  }

  if (error.response?.status === 401) {
    clearApiAuthToken();
    return "Your administrator session is invalid or expired. Sign in again and retry.";
  }

  if (error.response?.status === 403) {
    return "Administrator permission is required to change products.";
  }

  return error.response?.data?.message || fallback;
}

function toApiProduct(values) {
  const product = {
    sku: values.sku,
    name: values.name,
    category_id: values.categoryId,
    description: values.description || null,
    price: values.price,
    stock_quantity: values.stockQuantity,
  };

  if (values.image) product.image_url = values.image;

  return product;
}

export default function ProductListPage() {
  const {
    notify,
    notifyProductsChanged,
    productsRevision,
    requestAdminAccess,
  } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offlineFallback, setOfflineFallback] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null);

  const loadProducts = useCallback(async (signal) => {
    try {
      const productList = await fetchProductList(signal);
      if (signal?.aborted) return;
      setProducts(productList);
      setError("");
      setOfflineFallback(false);
    } catch (requestError) {
      if (signal?.aborted || requestError.code === "ERR_CANCELED") return;

      if (!requestError.response) {
        setProducts(initialProducts);
        setOfflineFallback(true);
        setError("");
      } else {
        setError(
          "Unable to load products. Check the API connection and try again."
        );
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadProducts(controller.signal);
    return () => controller.abort();
  }, [loadProducts, productsRevision]);

  const refreshProducts = () => {
    setLoading(true);
    setError("");
    loadProducts();
  };

  const categories = [
    ...new Set(products.map((product) => product.category || "Uncategorized")),
  ];
  const categoryFilteredProducts = products.filter(
    (product) =>
      !selectedCategory ||
      (product.category || "Uncategorized") === selectedCategory
  );
  const visibleProducts = categoryFilteredProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const openEdit = (product) => {
    requestAdminAccess(() => {
      setEditingProduct(product);
      setFormOpen(true);
    });
  };

  const openCreate = () => {
    requestAdminAccess(() => {
      setEditingProduct(null);
      setFormOpen(true);
    });
  };

  const openDelete = (product) => {
    requestAdminAccess(() => {
      setDeleteError("");
      setDeletingProduct(product);
    });
  };

  const handleSave = async (values) => {
    try {
      const response = editingProduct
        ? await api.patch(
            `/products/${editingProduct.id}`,
            toApiProduct(values)
          )
        : await api.post("/products", toApiProduct(values));
      const savedProduct = normalizeProduct(
        response.data?.data ?? response.data
      );

      if (editingProduct) {
        setProducts((current) =>
          current.map((product) =>
            String(product.id) === String(savedProduct.id)
              ? savedProduct
              : product
          )
        );
        notify("Product updated successfully.");
      } else {
        setProducts((current) => [savedProduct, ...current]);
        notify("Product added successfully.");
      }

      notifyProductsChanged();
      setFormOpen(false);
      setEditingProduct(null);
    } catch (requestError) {
      throw new Error(
        getApiErrorMessage(
          requestError,
          editingProduct
            ? "Unable to update product. Check the fields and try again."
            : "Unable to create product. Check the fields and try again."
        )
      );
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async () => {
    if (!deletingProduct || deleting) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await api.delete(`/products/${deletingProduct.id}`);
      setProducts((current) =>
        current.filter(
          (product) => String(product.id) !== String(deletingProduct.id)
        )
      );
      setDeletingProduct(null);
      notify("Product deleted successfully.");
      notifyProductsChanged();
    } catch (requestError) {
      const message = getApiErrorMessage(
        requestError,
        "Unable to delete product. Please try again."
      );
      setDeleteError(message);
      notify(message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeletingProduct(null);
    setDeleteError("");
  };

  return (
    <main className="page-container catalog-page">
      <Box
        component="section"
        aria-labelledby="catalog-hero-title"
        sx={{
          width: "100vw",
          minHeight: { xs: 250, sm: 200 },
          ml: "calc(50% - 50vw)",
          mb: 4,
          display: "flex",
          alignItems: "center",
          color: "#fff",
          backgroundImage: `linear-gradient(90deg, rgba(3, 18, 22, 0.82), rgba(3, 18, 22, 0.52) 55%, rgba(3, 18, 22, 0.24)), url("${heroBackground}")`,
          backgroundSize: "cover",
          backgroundPosition: { xs: "58% center", md: "center 52%" },
        }}
      >
        <Box
          sx={{
            width: "min(1200px, 100%)",
            mx: "auto",
            px: { xs: 1.5, sm: 2 },
            pt: { xs: 8, sm: 9 },
            pb: { xs: 2, sm: 2 },
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1fr) minmax(380px, 460px)",
            },
            alignItems: "center",
            gap: { xs: 2.5, md: 4 },
          }}
        >
          <Box>
          <Typography
            variant="h4"
            component="h1"
            id="catalog-hero-title"
            sx={{
              fontFamily: '"EB Garamond", serif',
              color: "#fff",
              textShadow: "0 2px 12px rgba(0, 0, 0, 0.4)",
              fontSize: { xs: "2rem", sm: "2.125rem" },
              lineHeight: 1.1,
            }}
          >
            Bring Your Aquarium to Life
          </Typography>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.92)" }}>
            Shop premium fish species, accessories, and complete tank setups.
          </Typography>
          </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
            flexWrap: "nowrap",
          }}
        >
          <Autocomplete
            size="small"
            options={categoryFilteredProducts}
            getOptionLabel={(product) => product.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            inputValue={searchQuery}
            onInputChange={(_event, value) => setSearchQuery(value)}
            onChange={(_event, product) =>
              setSearchQuery(product?.name ?? "")
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search products"
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps.input,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                        {params.slotProps.input.startAdornment}
                      </>
                    ),
                  },
                  htmlInput: {
                    ...params.slotProps.htmlInput,
                    "aria-label": "Search products by name",
                  },
                }}
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  width: "100%",
                }}
              />
            )}
            sx={{ flex: "1 1 0%", minWidth: 0 }}
          />
          <IconButton
            aria-label="Filter products by category"
            aria-haspopup="menu"
            aria-expanded={Boolean(categoryMenuAnchor)}
            onClick={(event) => setCategoryMenuAnchor(event.currentTarget)}
            sx={{
              flexShrink: 0,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "#fff",
              color: "primary.main",
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            <FilterListIcon />
          </IconButton>
          <Tooltip arrow title="Refresh products">
            <span>
              <IconButton
                aria-label="Refresh products"
                onClick={refreshProducts}
                disabled={loading}
                sx={{
                  flexShrink: 0,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "#fff",
                  color: "primary.main",
                  "&:hover": { bgcolor: "#f1f5f9" },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip arrow title="Add Product">
            <IconButton
              aria-label="Add Product"
              onClick={openCreate}
              sx={{
                flexShrink: 0,
                bgcolor: "secondary.main",
                color: "secondary.contrastText",
                "&:hover": { bgcolor: "secondary.dark" },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={categoryMenuAnchor}
            open={Boolean(categoryMenuAnchor)}
            onClose={() => setCategoryMenuAnchor(null)}
          >
            <MenuItem
              selected={!selectedCategory}
              onClick={() => {
                setSelectedCategory("");
                setCategoryMenuAnchor(null);
              }}
            >
              All categories
            </MenuItem>
            {categories.map((category) => (
              <MenuItem
                key={category}
                selected={selectedCategory === category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCategoryMenuAnchor(null);
                }}
              >
                {category}
              </MenuItem>
            ))}
          </Menu>
        </Box>
        </Box>
      </Box>

      <Box sx={{ width: "min(1200px, 100%)", mx: "auto" }}>
        {offlineFallback && !loading && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            The API is offline. Showing the saved preview catalog; changes will
            not be saved until the API connection is restored.
          </Alert>
        )}
        {loading ? (
          <Box
            role="status"
            aria-label="Loading products"
            sx={{ display: "flex", justifyContent: "center", py: 6 }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={refreshProducts}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        ) : products.length === 0 ? (
          <Alert severity="info">There are no products yet. Add your first product.</Alert>
        ) : visibleProducts.length === 0 ? (
          <Alert severity="info">No products match your search or category filter.</Alert>
        ) : (
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))}
          </div>
        )}
      </Box>

      <ProductFormDialog
        open={formOpen}
        product={editingProduct}
        onClose={handleCloseForm}
        onSave={handleSave}
      />

      <DeleteProductDialog
        product={deletingProduct}
        error={deleteError}
        deleting={deleting}
        onClose={closeDelete}
        onConfirm={handleDelete}
      />

    </main>
  );
}