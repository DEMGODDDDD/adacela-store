import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

export default function AdminLoginDialog({ open, onClose, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    if (submitting) return;
    setEmail("");
    setPassword("");
    setError("");
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await onLogin({ email: email.trim(), password });
      setEmail("");
      setPassword("");
      onClose();
    } catch (loginError) {
      const validationErrors = loginError.response?.data?.errors;
      const isTimeout =
        loginError.code === "ECONNABORTED" || loginError.code === "ETIMEDOUT";
      setError(
        (validationErrors && Object.values(validationErrors).flat().join(" ")) ||
          loginError.response?.data?.message ||
          (isTimeout
            ? "The API request timed out. Check that the backend is running and reachable."
            : "") ||
          loginError.message ||
          "Unable to sign in as an administrator."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="admin-login-title"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle id="admin-login-title">Administrator sign in</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="normal"
            fullWidth
            label="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={submitting}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={submitting}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
