import { type PropsWithChildren } from "react";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

const NavBtn = ({ to, label }: { to: string; label: string }) => {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Button
      component={RouterLink}
      to={to}
      color="inherit"
      variant={active ? "outlined" : "text"}
      sx={{ borderColor: "rgba(255,255,255,0.6)" }}
    >
      {label}
    </Button>
  );
};

export function Layout({ children }: PropsWithChildren) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f7f7f7" }}>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Transfer CRM
          </Typography>
          <NavBtn to="/customers" label="Клиенты" />
          <NavBtn to="/orders" label="Заказы" />
          <NavBtn to="/invoices/new" label="Создать счет" />
          <NavBtn to="/company" label="Реквизиты" />
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>{children}</Container>
    </Box>
  );
}