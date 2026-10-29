import { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function Header({ overlay = false, light = false }) {
  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    if (!overlay) return undefined;

    const updateScrollState = () => {
      const hero = document.querySelector('[aria-labelledby="catalog-hero-title"]');
      const headerHeight =
        document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      setIsPastHero(
        hero
          ? hero.getBoundingClientRect().bottom <= headerHeight
          : window.scrollY > 0
      );
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [overlay]);

  const showGlass = overlay && isPastHero;
  const useDarkText = showGlass || light;

  return (
    <AppBar
      position={overlay ? "fixed" : "sticky"}
      elevation={overlay ? 0 : 1}
      sx={{
        color: useDarkText ? "#0f172a" : "#ffffff",
        bgcolor: overlay
          ? showGlass
            ? "#ffffff"
            : "transparent"
          : light
            ? "#ffffff"
            : "primary.main",
        boxShadow: overlay
          ? showGlass
            ? "0 4px 20px rgba(0, 0, 0, 0.08)"
            : "none"
          : undefined,
        borderBottom: overlay ? "none" : undefined,
        backdropFilter: overlay ? "none" : undefined,
        WebkitBackdropFilter: overlay ? "none" : undefined,
        transition: "all 0.3s ease-in-out",
        "& .MuiTypography-root, & .MuiButtonBase-root": {
          color: useDarkText ? "#0f172a" : "inherit",
          transition: "all 0.3s ease-in-out",
        },
        ...(overlay && {
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          "&:hover": {
            bgcolor: "#ffffff",
            color: "#0f172a",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
            borderBottom: "none",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            "& .MuiTypography-root, & .MuiButtonBase-root": {
              color: "#0f172a",
            },
          },
        }),
      }}
    >
      <Toolbar
        sx={{
          position: "relative",
          width: "min(1200px, 100%)",
          mx: "auto",
        }}
      >
        <Typography
          component={RouterLink}
          to="/"
          variant="h4"
          sx={{
            color: "inherit",
            textDecoration: "none",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: '"Jost", sans-serif',
            fontWeight: 500,
            letterSpacing: { xs: "0.06em", sm: "0.10em" },
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            fontSize: { xs: "1rem", sm: "2.125rem" },
          }}
        >
          Adacela Fish Store
        </Typography>
      </Toolbar>
    </AppBar>
  );
}