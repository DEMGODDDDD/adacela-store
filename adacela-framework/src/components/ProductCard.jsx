import { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Rating,
  Typography,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link as RouterLink } from "react-router-dom";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(price));

export default function ProductCard({ product, onEdit, onDelete }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const cardRef = useRef(null);
  const rating = product.rating ?? 4.8;
  const reviewsCount = product.reviewsCount ?? 6;
  const isInStock = product.inStock ?? true;

  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement || !("IntersectionObserver" in window)) {
      return undefined;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1, rootMargin: "0px 0px -24px 0px" }
    );

    observer.observe(cardElement);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={cardRef}
      sx={{
        height: "100%",
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 420ms ease, transform 420ms ease",
        "@media (prefers-reduced-motion: reduce)": {
          opacity: 1,
          transform: "none",
          transition: "none",
        },
      }}
    >
      <Card
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 2,
          border: "1px solid #e2e8f0",
          bgcolor: "#fff",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
          transition: "transform 180ms ease, box-shadow 180ms ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
            "& .product-card-media": { transform: "scale(1.05)" },
          },
          "&:focus-within": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: 2,
          },
        }}
      >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          bgcolor: "#e2e8f0",
        }}
      >
        <CardMedia
          className="product-card-media"
          component="img"
          sx={{
            height: { xs: 132, sm: 220 },
            objectFit: "cover",
            transition: "transform 300ms ease",
          }}
          image={product.image || "https://placehold.co/600x400?text=Product"}
          alt={product.name}
        />
        <Chip
          label={product.category || "Uncategorized"}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            bgcolor: "rgba(15, 23, 42, 0.78)",
            color: "#fff",
            fontWeight: 600,
            backdropFilter: "blur(4px)",
            height: 22,
            fontSize: "0.68rem",
          }}
        />
        <Tooltip
          arrow
          title={isWishlisted ? "Remove from favorites" : "Add to favorites"}
        >
          <IconButton
            aria-label={
              isWishlisted
                ? `Remove ${product.name} from favorites`
                : `Add ${product.name} to favorites`
            }
            aria-pressed={isWishlisted}
            onClick={() => setIsWishlisted((current) => !current)}
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              bgcolor: "rgba(255, 255, 255, 0.9)",
              width: 32,
              height: 32,
              "&:hover": { bgcolor: "#fff" },
            }}
          >
            {isWishlisted ? (
              <FavoriteIcon sx={{ color: "error.main" }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: "text.secondary" }} />
            )}
          </IconButton>
        </Tooltip>
        {!isInStock && (
          <Chip
            label="Sold out"
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              bgcolor: "rgba(71, 103, 125, 0.92)",
              color: "#fff",
              fontSize: "0.65rem",
              height: 21,
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 1.25 }, pb: 1 }}>
        <Typography
          variant="subtitle2"
          component="h2"
          sx={{
            fontWeight: 700,
            lineHeight: 1.25,
            mb: 0.25,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
            minHeight: "2.5em",
          }}
        >
          {product.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.25,
            mb: 0.5,
            whiteSpace: "nowrap",
          }}
        >
          <Rating
            aria-label={`Rated ${rating} out of 5`}
            value={rating}
            precision={0.1}
            size="small"
            readOnly
            sx={{
              color: "#f59e0b",
              fontSize: { xs: "0.85rem", sm: "1rem" },
              "& .MuiRating-iconEmpty": { color: "#d1d5db" },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
            ({reviewsCount})
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{ color: "#0288d1", fontWeight: 700, mt: 0.25 }}
        >
          {formatPrice(product.price)}
        </Typography>
      </CardContent>

      <CardActions
        sx={{
          justifyContent: "space-between",
          px: { xs: 0.5, sm: 1.25 },
          pb: 0.75,
          pt: 0.5,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Tooltip arrow title="Details">
          <IconButton
            component={RouterLink}
            to={`/products/${product.id}`}
            aria-label={`View ${product.name} details`}
            size="small"
            color="info"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip arrow title="Edit product">
          <IconButton
            aria-label={`Edit ${product.name}`}
            size="small"
            color="primary"
            onClick={() => onEdit(product)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip arrow title="Delete product">
          <IconButton
            aria-label={`Delete ${product.name}`}
            size="small"
            color="error"
            onClick={() => onDelete(product)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
      </Card>
    </Box>
  );
}