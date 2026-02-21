import { useEffect, useMemo, useState } from "react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Select,
  Stack, TextField, Typography
} from "@mui/material";
import type { Customer, Order, OrderStatus } from "../api/endpoints";

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
    vehicleType?: string;
    driverName?: string;
    price: string;
    status?: OrderStatus;
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
      vehicleType: initial?.vehicleType || "",
      driverName: initial?.driverName || "",
      price: initial?.price || "0.00",
      status: (initial?.status || "draft") as OrderStatus,
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

    // input type="datetime-local" => локальное время без Z, конвертируем в ISO
    const pickupIso = new Date(form.pickupAt).toISOString();

    setSaving(true);
    try {
      await onSubmit({
        customerId: form.customerId,
        pickupAt: pickupIso,
        fromLocation: form.fromLocation.trim(),
        toLocation: form.toLocation.trim(),
        vehicleType: form.vehicleType.trim() || undefined,
        driverName: form.driverName.trim() || undefined,
        price: String(form.price),
        status: form.status,
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
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
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
            <TextField
              fullWidth
              label="Тип авто (опц.)"
              value={form.vehicleType}
              onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
            />
            <TextField
              fullWidth
              label="Водитель (опц.)"
              value={form.driverName}
              onChange={(e) => setForm({ ...form, driverName: e.target.value })}
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Цена"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                label="Статус"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}
              >
                <MenuItem value="draft">draft</MenuItem>
                <MenuItem value="confirmed">confirmed</MenuItem>
                <MenuItem value="done">done</MenuItem>
                <MenuItem value="canceled">canceled</MenuItem>
              </Select>
            </FormControl>
          </Stack>

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
        <Button onClick={onClose} disabled={saving}>Отмена</Button>
        <Button variant="contained" onClick={submit} disabled={saving}>
          {saving ? "Сохраняю…" : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}