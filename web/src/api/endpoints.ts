import { api } from "./client";

export type Customer = {
  id: string;
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export type OrderStatus = "draft" | "confirmed" | "done" | "canceled";

export type Order = {
  id: string;
  pickupAt: string;
  fromLocation: string;
  toLocation: string;
  vehicleType?: string | null;
  driverName?: string | null;
  price: string;
  status: OrderStatus;
  notes?: string | null;
  customer: Customer;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "canceled";

export type InvoiceItem = {
  id: string;
  qty: number;
  description: string;
  unitPrice: string;
  amount: string;
  order?: Order | null;
};

export type Invoice = {
  id: string;
  invoiceNo: string;
  issueDate: string;
  dueDate?: string | null;
  paymentMethod?: string | null;
  status: InvoiceStatus;
  total: string;
  customer: Customer;
  items: InvoiceItem[];
};

export type CompanyProfile = {
  id: string;
  companyName: string;
  address?: string | null;
  taxId?: string | null;
  website?: string | null;
  bankName?: string | null;
  iban?: string | null;
  swift?: string | null;
  notes?: string | null;
};

// Customers
export async function getCustomers(q?: string) {
  const res = await api.get<Customer[]>("/customers", { params: q ? { q } : undefined });
  return res.data;
}

// Orders
export async function getOrders(params?: { customerId?: string; status?: OrderStatus; from?: string; to?: string }) {
  const res = await api.get<Order[]>("/orders", { params });
  return res.data;
}

// Invoices
export async function createInvoice(payload: {
  customerId: string;
  orderIds: string[];
  issueDate: string;
  dueDate?: string;
  paymentMethod?: string;
}) {
  const res = await api.post<Invoice>("/invoices", payload);
  return res.data;
}

export async function getInvoice(id: string) {
  const res = await api.get<Invoice>(`/invoices/${id}`);
  return res.data;
}

export function invoicePdfUrl(id: string) {
  const base = import.meta.env.VITE_API_URL || "http://localhost:3000";
  return `${base}/invoices/${id}/pdf`;
}

// Company profile
export async function getCompanyProfile() {
  const res = await api.get<CompanyProfile | null>("/company-profile");
  return res.data;
}

export async function upsertCompanyProfile(payload: Omit<CompanyProfile, "id">) {
  const res = await api.put<CompanyProfile>("/company-profile", payload);
  return res.data;
}

// Customers create/update
export async function createCustomer(payload: {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}) {
  const res = await api.post<Customer>("/customers", payload);
  return res.data;
}

export async function updateCustomer(id: string, payload: Partial<{
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}>) {
  const res = await api.patch<Customer>(`/customers/${id}`, payload);
  return res.data;
}

// Orders create/update
export async function createOrder(payload: {
  customerId: string;
  pickupAt: string;
  fromLocation: string;
  toLocation: string;
  vehicleType?: string;
  driverName?: string;
  price: string;
  status?: OrderStatus;
  notes?: string;
}) {
  const res = await api.post<Order>("/orders", payload);
  return res.data;
}

export async function updateOrder(id: string, payload: Partial<{
  customerId: string;
  pickupAt: string;
  fromLocation: string;
  toLocation: string;
  vehicleType: string;
  driverName: string;
  price: string;
  status: OrderStatus;
  notes: string;
}>) {
  const res = await api.patch<Order>(`/orders/${id}`, payload);
  return res.data;
}

export async function setInvoiceStatus(id: string, status: InvoiceStatus) {
  const res = await api.patch<Invoice>(`/invoices/${id}/status`, { status });
  return res.data;
}