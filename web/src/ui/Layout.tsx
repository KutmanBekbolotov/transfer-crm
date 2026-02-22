import { type PropsWithChildren } from "react";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/orders", label: "Заказы" },
  { to: "/customers", label: "Клиенты" },
  { to: "/invoices/new", label: "Новый счет" },
  { to: "/company", label: "Реквизиты" },
];

const NavBtn = ({ to, label }: { to: string; label: string }) => {
  const loc = useLocation();
  const active = to === "/invoices/new" ? loc.pathname.startsWith("/invoices") : loc.pathname === to;
  return (
    <Button
      component={RouterLink}
      to={to}
      variant={active ? "contained" : "text"}
      color={active ? "primary" : "inherit"}
      sx={{
        borderRadius: "999px",
        px: 2,
        color: active ? "primary.contrastText" : "text.primary",
        background: active
          ? "linear-gradient(120deg, rgba(16, 41, 71, 1), rgba(31, 71, 119, 1))"
          : "transparent",
      }}
    >
      {label}
    </Button>
  );
};

export function Layout({ children }: PropsWithChildren) {
  const today = new Intl.DateTimeFormat("ru-RU", { dateStyle: "full" }).format(new Date());

  return (
    <Box className="app-shell">
      <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 3 } }}>
        <Paper
          className="surface-card"
          sx={{
            p: { xs: 2.2, md: 2.8 },
            borderRadius: 5,
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", lg: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.08em" }}>
                ОПЕРАЦИОННАЯ ПЛАТФОРМА
              </Typography>
              <Typography className="page-title" sx={{ mt: 0.4 }}>
                CRM-система Transfer Capital
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.4 }}>
                Управление клиентами, заказами и выставлением счетов в едином контуре.
              </Typography>
            </Box>

            <Stack spacing={1.2} alignItems={{ xs: "flex-start", lg: "flex-end" }} width={{ xs: "100%", lg: "auto" }}>
              <Typography
                variant="body2"
                sx={{
                  px: 1.5,
                  py: 0.7,
                  borderRadius: 10,
                  border: "1px solid rgba(16, 41, 71, 0.15)",
                  color: "text.secondary",
                }}
              >
                {today}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {NAV_ITEMS.map((item) => (
                  <NavBtn key={item.to} to={item.to} label={item.label} />
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Box sx={{ mt: { xs: 2, md: 2.6 } }}>{children}</Box>
      </Container>
    </Box>
  );
}
