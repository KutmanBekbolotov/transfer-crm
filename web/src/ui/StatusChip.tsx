import { Chip } from "@mui/material";
import type { InvoiceStatus, OrderStatus, PaymentStatus } from "../api/endpoints";
import { getInvoiceStatusMeta, getOrderStatusMeta, getPaymentStatusMeta } from "./format";

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  const meta = getOrderStatusMeta(status);
  return <Chip size="small" label={meta.label} color={meta.color} />;
}

export function InvoiceStatusChip({ status }: { status: InvoiceStatus }) {
  const meta = getInvoiceStatusMeta(status);
  return <Chip size="small" label={meta.label} color={meta.color} />;
}

export function PaymentStatusChip({
  status,
  dueDate,
}: {
  status: PaymentStatus;
  dueDate?: string | null;
}) {
  const meta = getPaymentStatusMeta(status, dueDate);
  return <Chip size="small" label={meta.label} color={meta.color} />;
}
