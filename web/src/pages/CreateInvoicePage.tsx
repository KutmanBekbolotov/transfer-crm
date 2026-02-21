import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createInvoice, getCustomers, getOrders } from "../api/endpoints";
import type { Order } from "../api/endpoints";
import {
  Button, Card, CardContent, Checkbox, CircularProgress, Divider, FormControl,
  InputLabel, MenuItem, Select, Stack, TextField, Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function todayYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function CreateInvoicePage() {
  const nav = useNavigate();

  const [customerId, setCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState(todayYmd());
  const [dueDate, setDueDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const { data: customers } = useQuery({
    queryKey: ["customers", "for-invoice"],
    queryFn: () => getCustomers(undefined),
  });

  const ordersKey = useMemo(() => ["orders", "for-invoice", customerId], [customerId]);
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ordersKey,
    queryFn: () => (customerId ? getOrders({ customerId }) : Promise.resolve([])),
    enabled: Boolean(customerId),
  });

  const selectedOrderIds = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const totalSelected = (orders || [])
    .filter((o) => selected[o.id])
    .reduce((sum, o) => sum + Number(o.price), 0)
    .toFixed(2);

  const mut = useMutation({
    mutationFn: () =>
      createInvoice({
        customerId,
        orderIds: selectedOrderIds,
        issueDate,
        dueDate: dueDate || undefined,
        paymentMethod: paymentMethod || undefined,
      }),
    onSuccess: (invoice) => nav(`/invoices/${invoice.id}`),
  });

  const toggle = (o: Order) => {
    setSelected((prev) => ({ ...prev, [o.id]: !prev[o.id] }));
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Создать счет</Typography>

      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Клиент</InputLabel>
              <Select
                label="Клиент"
                value={customerId}
                onChange={(e) => {
                  setCustomerId(String(e.target.value));
                  setSelected({});
                }}
              >
                <MenuItem value="">Выбери клиента…</MenuItem>
                {(customers || []).map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField fullWidth label="Issue date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            <TextField fullWidth label="Due date (опц.)" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <TextField fullWidth label="Payment method (опц.)" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
          </Stack>

          <Divider sx={{ my: 2 }} />

          {!customerId && (
            <Typography color="text.secondary">Выбери клиента, чтобы показать его заказы</Typography>
          )}

          {ordersLoading && <CircularProgress />}

          {(orders || []).map((o) => (
            <Stack
              key={o.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ py: 1 }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Checkbox checked={Boolean(selected[o.id])} onChange={() => toggle(o)} />
                <div>
                  <Typography fontWeight={700}>
                    {o.fromLocation} → {o.toLocation}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(o.pickupAt).toLocaleString()} • {o.status}
                  </Typography>
                </div>
              </Stack>

              <Typography fontWeight={700}>{o.price}</Typography>
            </Stack>
          ))}

          {customerId && (orders?.length ?? 0) === 0 && !ordersLoading && (
            <Typography color="text.secondary">У этого клиента пока нет заказов</Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
            <Typography>
              Выбрано: <b>{selectedOrderIds.length}</b> • Сумма: <b>{totalSelected}</b>
            </Typography>

            <Button
              variant="contained"
              disabled={!customerId || selectedOrderIds.length === 0 || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mut.isPending ? "Создаю…" : "Создать счет"}
            </Button>
          </Stack>

          {mut.isError && (
            <Typography color="error" sx={{ mt: 1 }}>
              Ошибка создания счета
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
