import { ruRU } from "@mui/material/locale";
import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme(
  {
    shape: {
      borderRadius: 18,
    },
    palette: {
      mode: "light",
      primary: {
        main: "#102947",
        dark: "#0b1f38",
        light: "#1f4777",
        contrastText: "#f7f3ea",
      },
      secondary: {
        main: "#b38744",
      },
      background: {
        default: "#efe7da",
        paper: "#fffcf6",
      },
      text: {
        primary: "#102947",
        secondary: "#5f6d7d",
      },
      success: {
        main: "#156b4a",
      },
      warning: {
        main: "#b26a1a",
      },
      error: {
        main: "#c0392b",
      },
      info: {
        main: "#1f5986",
      },
    },
    typography: {
      fontFamily: '"Manrope", "Segoe UI", sans-serif',
      h1: {
        fontFamily: '"Unbounded", "Manrope", sans-serif',
        fontWeight: 700,
      },
      h2: {
        fontFamily: '"Unbounded", "Manrope", sans-serif',
        fontWeight: 700,
      },
      h3: {
        fontFamily: '"Unbounded", "Manrope", sans-serif',
        fontWeight: 700,
      },
      h4: {
        fontFamily: '"Unbounded", "Manrope", sans-serif',
        fontWeight: 700,
      },
      h5: {
        fontFamily: '"Unbounded", "Manrope", sans-serif',
        fontWeight: 700,
      },
      h6: {
        fontFamily: '"Unbounded", "Manrope", sans-serif',
        fontWeight: 700,
      },
      button: {
        fontWeight: 700,
        textTransform: "none",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            paddingInline: 16,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: "1px solid rgba(16, 41, 71, 0.1)",
            boxShadow: "0 14px 40px rgba(16, 41, 71, 0.08)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            border: "1px solid rgba(16, 41, 71, 0.09)",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            color: "#102947",
            backgroundColor: "rgba(16, 41, 71, 0.04)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
        },
      },
    },
  },
  ruRU
);
