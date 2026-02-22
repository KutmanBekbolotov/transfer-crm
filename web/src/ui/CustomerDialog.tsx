import { useEffect, useMemo, useState } from "react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, TextField, Typography
} from "@mui/material";
import type { Customer } from "../api/endpoints";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Customer | null;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
  }) => Promise<void>;
};

export function CustomerDialog({ open, mode, initial, onClose, onSubmit }: Props) {
  const title = mode === "create" ? "Добавить клиента" : "Редактировать клиента";

  const init = useMemo(
    () => ({
      name: initial?.name || "",
      contactPerson: initial?.contactPerson || "",
      phone: initial?.phone || "",
      email: initial?.email || "",
      address: initial?.address || "",
    }),
    [initial]
  );

  const [form, setForm] = useState(init);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>("");

  useEffect(() => setForm(init), [init, open]);

  const submit = async () => {
    setErr("");
    if (!form.name.trim()) {
      setErr("Имя клиента обязательно");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      onClose();
    } catch {
      setErr("Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Название клиента"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            autoFocus
          />
          <TextField
            label="Контактное лицо"
            value={form.contactPerson}
            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
          />
          <TextField
            label="Телефон"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            label="Электронная почта"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="Адрес"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
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
