import type { InvoiceStatus, OrderStatus, PaymentStatus, VehicleType } from "../api/endpoints";

type BadgeColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

export type StatusMeta = {
  label: string;
  color: BadgeColor;
};

const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  draft: { label: "Черновик", color: "default" },
  confirmed: { label: "Подтвержден", color: "info" },
  done: { label: "Выполнен", color: "success" },
  canceled: { label: "Отменен", color: "error" },
};

const INVOICE_STATUS_META: Record<InvoiceStatus, StatusMeta> = {
  draft: { label: "Черновик", color: "default" },
  sent: { label: "Отправлен", color: "info" },
  paid: { label: "Оплачен", color: "success" },
  canceled: { label: "Отменен", color: "error" },
};

const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  unpaid: { label: "Не оплачен", color: "warning" },
  paid: { label: "Оплачен", color: "success" },
};

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  sedan: "Седан",
  minivan: "Минивен",
  suv: "Джип",
};

export function getOrderStatusMeta(status: OrderStatus): StatusMeta {
  return ORDER_STATUS_META[status];
}

export function getInvoiceStatusMeta(status: InvoiceStatus): StatusMeta {
  return INVOICE_STATUS_META[status];
}

function parseDateOnly(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const y = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  return new Date(y, month, day);
}

function isOverdue(dueDate?: string | null): boolean {
  if (!dueDate) return false;
  const due = parseDateOnly(dueDate);
  if (!due) return false;

  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function getPaymentStatusMeta(status: PaymentStatus, dueDate?: string | null): StatusMeta {
  if (status === "unpaid" && isOverdue(dueDate)) {
    return { label: "Просрочен", color: "error" };
  }
  return PAYMENT_STATUS_META[status];
}

export function getVehicleTypeLabel(vehicleType?: VehicleType | null): string {
  if (!vehicleType) return "Не указан";
  return VEHICLE_TYPE_LABELS[vehicleType] ?? "Не указан";
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(d);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatAmount(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "0,00";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
