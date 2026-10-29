import {
  Alert,
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  Divider,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import BoltIcon from "@mui/icons-material/Bolt";
import { Link as RouterLink, useOutletContext, useParams } from "react-router-dom";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(price));

export default function ProductDetailsPage({ products }) {
  const { id } = useParams();
  const { onAddToCart, onBuyNow } = useOutletContext();
  const product = products.find((item) => String(item.id) === id);

  if (!product) {
    return (
      <main className="page-container">
        <Alert severity="warning">Product not found.</Alert>
        <Button component={RouterLink} to="/" sx={{ mt: 2 }}>
          Back to products
        </Button>
      </main>
    );
  }

  return (
    <main className="page-container">
      <Button component={RouterLink} to="/" sx={{ mb: 2 }}>
        ← Back to products
      </Button>
      <Card
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          overflow: "hidden",
          borderRadius: 3,
        }}
      >
        <CardMedia
          component="img"
          image={product.image || "https://placehold.co/600x400?text=Product"}
          alt={product.name}
          sx={{
            height: { xs: 280, md: "100%" },
            minHeight: 360,
            objectFit: "cover",
            bgcolor: "#e2e8f0",
          }}
        />
        <Stack spacing={2} sx={{ p: { xs: 2.5, md: 4 }, alignItems: "flex-start" }}>
          <Chip label={product.category || "Uncategorized"} size="small" />
          <Typography variant="h4" component="h1">
            {product.name}
          </Typography>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
            {formatPrice(product.price)}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Rating
              value={product.rating ?? 4.8}
              precision={0.1}
              size="small"
              readOnly
              aria-label={`Rated ${product.rating ?? 4.8} out of 5`}
            />
            <Typography variant="body2" color="text.secondary">
              ({product.reviewsCount ?? 6} reviews)
            </Typography>
          </Box>
          <Chip
            label={product.inStock === false ? "Sold out" : "In stock"}
            color={product.inStock === false ? "default" : "success"}
            size="small"
          />
          <Typography variant="body2" color="text.secondary">
            <Box
              component="span"
              sx={{ color: "text.primary", fontWeight: 600, mr: 0.5 }}
            >
              Estimated size/weight:
            </Box>
            {product.estimatedMeasurement || "Not specified"}
          </Typography>
          <Divider flexItem />
          <Box>
            <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
              About this item
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {product.description || "No description provided."}
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: "100%", pt: 1 }}
          >
            <Button
              variant="outlined"
              startIcon={<AddShoppingCartIcon />}
              disabled={product.inStock === false}
              onClick={() => onAddToCart(product)}
              sx={{ bgcolor: "transparent" }}
            >
              Add to cart
            </Button>
            <Button
              variant="contained"
              startIcon={<BoltIcon />}
              disabled={product.inStock === false}
              onClick={() => onBuyNow(product)}
            >
              Buy now
            </Button>
          </Stack>
        </Stack>
      </Card>
    </main>
  );
}