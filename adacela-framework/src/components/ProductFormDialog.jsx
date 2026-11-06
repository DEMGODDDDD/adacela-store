import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import api from "../api/axios";

const emptyForm = {
  sku: "",
  name: "",
  price: "",
  categoryId: "",
  stockQuantity: "0",
  image: "",
  description: "",
  estimatedMeasurement: "",
};

export default function ProductFormDialog({ open, product, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const controller = new AbortController();
    setForm(
      product
        ? {
            sku: product.sku ?? "",
            name: product.name ?? "",
            price: String(product.price ?? ""),
            categoryId: String(product.categoryId ?? ""),
            stockQuantity: String(product.stock_quantity ?? 0),
            image: product.image ?? "",
            description: product.description ?? "",
            estimatedMeasurement: product.estimatedMeasurement ?? "",
          }
        : emptyForm
    );
    setErrors({});
    setSaveError("");
    setCategoriesError("");
    setCategoriesLoading(true);

    api
      .get("/categories", { params: { per_page: 100 }, signal: controller.signal })
      .then((response) => {
        const categoryList = Array.isArray(response.data)
          ? response.data
          : response.data?.data;
        if (!Array.isArray(categoryList)) {
          throw new Error("The API returned an invalid category list.");
        }
        setCategories(categoryList);
        if (product && !product.categoryId) {
          const matchingCategory = categoryList.find(
            (category) => category.name === product.category
          );
          if (matchingCategory) {
            setForm((current) => ({
              ...current,
              categoryId: String(matchingCategory.id),
            }));
          }
        }
      })
      .catch((requestError) => {
        if (requestError.code !== "ERR_CANCELED") {
          setCategoriesError(
            requestError.response?.data?.message ||
              "Unable to load categories. Close this form and try again."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      });

    return () => controller.abort();
  }, [open, product]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSaveError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const price = Number(form.price);
    const stockQuantity = Number(form.stockQuantity);

    if (!form.sku.trim()) nextErrors.sku = "SKU is required.";
    if (!form.name.trim()) nextErrors.name = "Product name is required.";
    if (form.price === "" || !Number.isFinite(price) || price < 0) {
      nextErrors.price = "Enter a valid price of zero or more.";
    }
    if (!form.categoryId) nextErrors.categoryId = "Choose a category.";
    if (
      form.stockQuantity === "" ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      nextErrors.stockQuantity = "Enter a whole number of zero or more.";
    }
    if (form.image.trim()) {
      try {
        const imageUrl = new URL(form.image.trim());
        if (!["http:", "https:"].includes(imageUrl.protocol)) {
          nextErrors.image = "Enter a valid HTTP or HTTPS image URL.";
        }
      } catch {
        nextErrors.image = "Enter a valid HTTP or HTTPS image URL.";
      }
    }

    setErrors(nextErrors);
    setSaveError("");

    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await onSave({
        sku: form.sku.trim(),
        name: form.name.trim(),
        price,
        categoryId: Number(form.categoryId),
        stockQuantity,
        image: form.image.trim(),
        description: form.description.trim(),
        estimatedMeasurement: form.estimatedMeasurement.trim(),
      });
    } catch (requestError) {
      setSaveError(requestError.message || "Unable to save this product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent>
          {saveError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {saveError}
            </Alert>
          )}
          {categoriesError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {categoriesError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="normal"
            fullWidth
            label="SKU"
            name="sku"
            value={form.sku}
            onChange={handleChange}
            error={Boolean(errors.sku)}
            helperText={errors.sku}
            required
            disabled={saving}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Product name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            disabled={saving}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Price (PHP)"
            name="price"
            type="number"
            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            value={form.price}
            onChange={handleChange}
            error={Boolean(errors.price)}
            helperText={errors.price}
            required
            disabled={saving}
          />
          <FormControl
            margin="normal"
            fullWidth
            required
            error={Boolean(errors.categoryId)}
            disabled={categoriesLoading || Boolean(categoriesError) || saving}
          >
            <InputLabel id="product-category-label">Category</InputLabel>
            <Select
              labelId="product-category-label"
              label="Category"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={String(category.id)}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            {categoriesLoading && <CircularProgress size={18} sx={{ mt: 1 }} />}
            {errors.categoryId && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.categoryId}
              </Alert>
            )}
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            label="Stock quantity"
            name="stockQuantity"
            type="number"
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
            value={form.stockQuantity}
            onChange={handleChange}
            error={Boolean(errors.stockQuantity)}
            helperText={errors.stockQuantity}
            required
            disabled={saving}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Image URL"
            name="image"
            value={form.image}
            onChange={handleChange}
            error={Boolean(errors.image)}
            helperText={errors.image}
            disabled={saving}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            multiline
            minRows={3}
            disabled={saving}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Estimated size or weight"
            name="estimatedMeasurement"
            placeholder="e.g. 3–4 in or Approx. 0.5 kg"
            value={form.estimatedMeasurement}
            onChange={handleChange}
            helperText="This field is not currently supported by the product API and will not persist."
            disabled={saving}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              saving || categoriesLoading || Boolean(categoriesError)
            }
          >
            {saving
              ? "Saving..."
              : product
                ? "Save Changes"
                : "Add Product"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}