import { useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useOutletContext } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import ProductFormDialog from "../components/ProductFormDialog";
import DeleteProductDialog from "../components/DeleteProductDialog";
import heroBackground from "../assets/hero-section.jpg";

export default function ProductListPage({
  products,
  onUpdate,
  onRemove,
}) {
  const { onAddProduct } = useOutletContext();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [notice, setNotice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null);

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
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleSave = (values) => {
    onUpdate(editingProduct.id, values);
    setNotice("Product updated successfully.");
    setFormOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = () => {
    if (!deletingProduct) return;
    onRemove(deletingProduct.id);
    setDeletingProduct(null);
    setNotice("Product deleted successfully.");
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
          <Tooltip arrow title="Add Product">
            <IconButton
              aria-label="Add Product"
              onClick={onAddProduct}
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
        {products.length === 0 ? (
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
                onDelete={setDeletingProduct}
              />
            ))}
          </div>
        )}
      </Box>

      <ProductFormDialog
        open={formOpen}
        product={editingProduct}
        onClose={() => {
          setFormOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
      />

      <DeleteProductDialog
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDelete}
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
    </main>
  );
}