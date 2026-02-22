import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Customer, Order, OrderStatus, PaymentStatus, VehicleType } from "../api/endpoints";
import { getOrderStatusMeta, getPaymentStatusMeta, getVehicleTypeLabel } from "./format";

const VEHICLE_OPTIONS: VehicleType[] = ["sedan", "minivan", "suv"];
const PAYMENT_OPTIONS: PaymentStatus[] = ["unpaid", "paid"];

function normalizeVehicleType(value?: string | null): VehicleType {
  return VEHICLE_OPTIONS.includes(value as VehicleType) ? (value as VehicleType) : "sedan";
}

function normalizePaymentStatus(value?: string | null): PaymentStatus {
  return PAYMENT_OPTIONS.includes(value as PaymentStatus) ? (value as PaymentStatus) : "unpaid";
}

type Props = {
  open: boolean;
  mode: "create" | "edit";
  customers: Customer[];
  initial?: Order | null;
  onClose: () => void;
  onSubmit: (payload: {
    customerId: string;
    pickupAt: string;
    fromLocation: string;
    toLocation: string;
    vehicleType?: VehicleType;
    carsCount?: number;
    driverName?: string;
    price: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    paymentDueDate?: string | null;
    notes?: string;
  }) => Promise<void>;
};

function isoNowPlusMinutes(min = 60) {
  const d = new Date(Date.now() + min * 60_000);
  return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

export function OrderDialog({ open, mode, customers, initial, onClose, onSubmit }: Props) {
  const title = mode === "create" ? "Добавить заказ" : "Редактировать заказ";

  const init = useMemo(
    () => ({
      customerId: initial?.customer?.id || "",
      pickupAt: initial?.pickupAt
        ? new Date(initial.pickupAt).toISOString().slice(0, 16)
        : isoNowPlusMinutes(60),
      fromLocation: initial?.fromLocation || "",
      toLocation: initial?.toLocation || "",
      vehicleType: normalizeVehicleType(initial?.vehicleType),
      carsCount: initial?.carsCount ?? 1,
      driverName: initial?.driverName || "",
      price: initial?.price || "0.00",
      status: (initial?.status || "draft") as OrderStatus,
      paymentStatus: normalizePaymentStatus(initial?.paymentStatus),
      paymentDueDate: initial?.paymentDueDate ? String(initial.paymentDueDate).slice(0, 10) : "",
      notes: initial?.notes || "",
    }),
    [initial]
  );

  const [form, setForm] = useState(init);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => setForm(init), [init, open]);

  const submit = async () => {
    setErr("");
    if (!form.customerId) return setErr("Выберите клиента");
    if (!form.pickupAt) return setErr("Укажите дату/время");
    if (!form.fromLocation.trim()) return setErr("Укажите откуда");
    if (!form.toLocation.trim()) return setErr("Укажите куда");
    if (!String(form.price).trim()) return setErr("Укажите цену");

    const carsCount = Number(form.carsCount);
    if (!Number.isInteger(carsCount) || carsCount < 1 || carsCount > 10) {
      return setErr("Количество машин должно быть от 1 до 10");
    }

    // Локальное время из datetime-local переводим в ISO для API.
    const pickupIso = new Date(form.pickupAt).toISOString();

    setSaving(true);
    try {
      await onSubmit({
        customerId: form.customerId,
        pickupAt: pickupIso,
        fromLocation: form.fromLocation.trim(),
        toLocation: form.toLocation.trim(),
        vehicleType: form.vehicleType,
        carsCount,
        driverName: form.driverName.trim() || undefined,
        price: String(form.price),
        status: form.status,
        paymentStatus: form.paymentStatus,
        paymentDueDate: form.paymentDueDate || null,
        notes: form.notes.trim() || undefined,
      });
      onClose();
    } catch {
      setErr("Не удалось сохранить заказ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Клиент</InputLabel>
            <Select
              label="Клиент"
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: String(e.target.value) })}
            >
              <MenuItem value="">Выбери…</MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Дата/время (локально)"
            type="datetime-local"
            value={form.pickupAt}
            onChange={(e) => setForm({ ...form, pickupAt: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Откуда"
            value={form.fromLocation}
            onChange={(e) => setForm({ ...form, fromLocation: e.target.value })}
          />
          <TextField
            label="Куда"
            value={form.toLocation}
            onChange={(e) => setForm({ ...form, toLocation: e.target.value })}
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Тип авто</InputLabel>
              <Select
                label="Тип авто"
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value as VehicleType })}
              >
                {VEHICLE_OPTIONS.map((v) => (
                  <MenuItem key={v} value={v}>
                    {getVehicleTypeLabel(v)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              inputProps={{ min: 1, max: 10, step: 1 }}
              label="Количество машин"
              value={form.carsCount}
              onChange={(e) => setForm({ ...form, carsCount: Number(e.target.value || "1") })}
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Водитель (опц.)"
              value={form.driverName}
              onChange={(e) => setForm({ ...form, driverName: e.target.value })}
            />
            <TextField
              fullWidth
              label="Цена (общая)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Статус исполнения</InputLabel>
              <Select
                label="Статус исполнения"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}
              >
                <MenuItem value="draft">{getOrderStatusMeta("draft").label}</MenuItem>
                <MenuItem value="confirmed">{getOrderStatusMeta("confirmed").label}</MenuItem>
                <MenuItem value="done">{getOrderStatusMeta("done").label}</MenuItem>
                <MenuItem value="canceled">{getOrderStatusMeta("canceled").label}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Статус оплаты</InputLabel>
              <Select
                label="Статус оплаты"
                value={form.paymentStatus}
                onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as PaymentStatus })}
              >
                {PAYMENT_OPTIONS.map((p) => (
                  <MenuItem key={p} value={p}>
                    {getPaymentStatusMeta(p, form.paymentDueDate).label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <TextField
            type="date"
            label="Оплатить до"
            value={form.paymentDueDate}
            onChange={(e) => setForm({ ...form, paymentDueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            helperText="Дата плановой оплаты заказа"
          />

          <TextField
            label="Заметки (опц.)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            multiline
            minRows={2}
          />

          {err && <Typography color="error">{err}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Отмена
        </Button>
        <Button variant="contained" onClick={submit} disabled={saving}>
          {saving ? "Сохраняю…" : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
