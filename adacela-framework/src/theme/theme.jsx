import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#344e86" },
    secondary: { main: "#E87524" },
    background: { default: "#F6F7FB" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif, "Oswald"',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
  },
});

export default theme;