import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInvoice, createOrder, getCustomers, getOrders, updateOrder,
  type Customer, type Order, type OrderStatus
} from "../api/endpoints";
import {
  Button, Card, CardContent, Checkbox, CircularProgress, Divider,
  FormControl, InputLabel, MenuItem, Select,
  Stack, TextField, Typography,
  Table, TableBody, TableCell, TableHead, TableRow
} from "@mui/material";
import { OrderDialog } from "../ui/OrderDialog";
import { useNavigate } from "react-router-dom";

function todayYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function OrdersPage() {
  const nav = useNavigate();
  const qc = useQueryClient();

  const [customerId, setCustomerId] = useState<string>("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [dlgOpen, setDlgOpen] = useState(false);
  const [edit, setEdit] = useState<Order | null>(null);

  const { data: customers = [] } = useQuery({
    queryKey: ["customers", "for-orders"],
    queryFn: () => getCustomers(undefined),
  });

  const ordersKey = useMemo(
    () => ["orders", { customerId, status, from, to }],
    [customerId, status, from, to]
  );

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ordersKey,
    queryFn: () =>
      getOrders({
        customerId: customerId || undefined,
        status: (status || undefined) as any,
        from: from || undefined,
        to: to || undefined,
      }),
  });

  const createOrderMut = useMutation({
    mutationFn: createOrder,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const updateOrderMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateOrder(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const createInvoiceMut = useMutation({
    mutationFn: (payload: {
      customerId: string;
      orderIds: string[];
      issueDate: string;
      dueDate?: string;
      paymentMethod?: string;
    }) => createInvoice(payload),
    onSuccess: (invoice) => nav(`/invoices/${invoice.id}`),
  });

  const toggle = (id: string) => setSelected((p) => ({ ...p, [id]: !p[id] }));
  const clearSelection = () => setSelected({});

  const selectedOrders = orders.filter((o) => selected[o.id]);
  const selectedCustomerIds = Array.from(new Set(selectedOrders.map((o) => o.customer?.id).filter(Boolean)));

  const canCreateInvoice =
    selectedOrders.length > 0 &&
    selectedCustomerIds.length === 1; // только один клиент

  const totalSelected = selectedOrders.reduce((sum, o) => sum + Number(o.price), 0).toFixed(2);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography variant="h5">Заказы</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            disabled={selectedOrders.length === 0}
            onClick={clearSelection}
          >
            Снять выбор
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setEdit(null);
              setDlgOpen(true);
            }}
          >
            Добавить заказ
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Клиент</InputLabel>
              <Select
                label="Клиент"
                value={customerId}
                onChange={(e) => setCustomerId(String(e.target.value))}
              >
                <MenuItem value="">Все</MenuItem>
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                label="Статус"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <MenuItem value="">Все</MenuItem>
                <MenuItem value="draft">draft</MenuItem>
                <MenuItem value="confirmed">confirmed</MenuItem>
                <MenuItem value="done">done</MenuItem>
                <MenuItem value="canceled">canceled</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Дата от (YYYY-MM-DD)"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="2026-02-01"
            />
            <TextField
              fullWidth
              label="Дата до (YYYY-MM-DD)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="2026-02-28"
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography>
              Выбрано: <b>{selectedOrders.length}</b> • Сумма: <b>{totalSelected}</b>
              {selectedOrders.length > 0 && selectedCustomerIds.length !== 1 && (
                <span style={{ color: "#b71c1c" }}> • Выберите заказы только одного клиента</span>
              )}
            </Typography>

            <Button
              variant="contained"
              disabled={!canCreateInvoice || createInvoiceMut.isPending}
              onClick={() => {
                const cid = selectedCustomerIds[0];
                createInvoiceMut.mutate({
                  customerId: cid,
                  orderIds: selectedOrders.map((o) => o.id),
                  issueDate: todayYmd(),
                });
              }}
            >
              {createInvoiceMut.isPending ? "Создаю…" : "Создать счет из выбранных"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading && <CircularProgress />}
          {error && <Typography color="error">Ошибка загрузки</Typography>}

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"></TableCell>
                <TableCell>Дата/время</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Маршрут</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Цена</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox checked={Boolean(selected[o.id])} onChange={() => toggle(o.id)} />
                  </TableCell>
                  <TableCell>{new Date(o.pickupAt).toLocaleString()}</TableCell>
                  <TableCell>{o.customer?.name}</TableCell>
                  <TableCell>{o.fromLocation} → {o.toLocation}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell align="right">{o.price}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setEdit(o);
                        setDlgOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!isLoading && orders.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Заказов нет по выбранным фильтрам
            </Typography>
          )}
        </CardContent>
      </Card>

      <OrderDialog
        open={dlgOpen}
        mode={edit ? "edit" : "create"}
        customers={customers as Customer[]}
        initial={edit}
        onClose={() => setDlgOpen(false)}
        onSubmit={async (payload) => {
          if (!edit) {
            await createOrderMut.mutateAsync(payload);
          } else {
            await updateOrderMut.mutateAsync({ id: edit.id, payload });
          }
        }}
      />
    </Stack>
  );
}