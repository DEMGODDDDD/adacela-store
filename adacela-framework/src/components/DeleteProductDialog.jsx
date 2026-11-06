import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function DeleteProductDialog({
  product,
  error,
  deleting = false,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={Boolean(product)}
      onClose={deleting ? undefined : onClose}
      aria-labelledby="delete-product-title"
    >
      <DialogTitle id="delete-product-title">Delete product?</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText>
          Are you sure you want to delete "{product?.name}"? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={deleting}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={deleting}
          startIcon={deleting ? <CircularProgress color="inherit" size={16} /> : null}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}