export function normalizeProduct(product) {
  if (!product || typeof product !== "object" || Array.isArray(product)) {
    throw new Error("The API returned an invalid product.");
  }

  const category = product.category;

  return {
    ...product,
    categoryId:
      typeof category === "object" ? category?.id : product.category_id,
    category:
      typeof category === "string"
        ? category
        : category?.name ?? "Uncategorized",
    price: product.final_price ?? product.price,
    rating: product.average_rating ?? product.rating,
    reviewsCount: product.reviews_count ?? product.reviewsCount,
    inStock:
      product.in_stock ??
      product.inStock ??
      Number(product.stock_quantity ?? 0) > 0,
  };
}
