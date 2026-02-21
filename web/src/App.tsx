import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./ui/Layout";
import { CustomersPage } from "./pages/CustomersPage";
import { OrdersPage } from "./pages/OrdersPage";
import { CreateInvoicePage } from "./pages/CreateInvoicePage";
import { InvoicePage } from "./pages/InvoicePage";
import { CompanyProfilePage } from "./pages/CompanyProfilePage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/orders" replace />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/invoices/new" element={<CreateInvoicePage />} />
        <Route path="/invoices/:id" element={<InvoicePage />} />
        <Route path="/company" element={<CompanyProfilePage />} />
        <Route path="*" element={<Navigate to="/orders" replace />} />
      </Routes>
    </Layout>
  );
}