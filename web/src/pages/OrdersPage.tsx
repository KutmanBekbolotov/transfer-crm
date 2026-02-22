import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInvoice,
  createOrder,
  getCustomers,
  getOrders,
  updateOrder,
  type Customer,
  type Order,
  type OrderStatus,
  type PaymentStatus,
  type VehicleType,
} from "../api/endpoints";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { OrderDialog } from "../ui/OrderDialog";
import { useNavigate } from "react-router-dom";
import { formatAmount, formatDate, formatDateTime, getOrderStatusMeta, getPaymentStatusMeta, getVehicleTypeLabel } from "../ui/format";
import { OrderStatusChip, PaymentStatusChip } from "../ui/StatusChip";

const ORDER_STATUSES: OrderStatus[] = ["draft", "confirmed", "done", "canceled"];
const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "paid"];
type OrderUpdatePayload = Partial<{
  customerId: string;
  pickupAt: string;
  fromLocation: string;
  toLocation: string;
  vehicleType: VehicleType;
  carsCount: number;
  driverName: string;
  price: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentDueDate: string | null;
  notes: string;
}>;

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
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
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
    () => ["orders", { customerId, status, paymentStatus, from, to }],
    [customerId, status, paymentStatus, from, to]
  );

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ordersKey,
    queryFn: () =>
      getOrders({
        customerId: customerId || undefined,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
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
    mutationFn: ({ id, payload }: { id: string; payload: OrderUpdatePayload }) => updateOrder(id, payload),
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
  const selectedCustomerIds = Array.from(
    new Set(selectedOrders.map((o) => o.customer?.id).filter((id): id is string => Boolean(id)))
  );

  const canCreateInvoice = selectedOrders.length > 0 && selectedCustomerIds.length === 1;
  const hasMixedCustomers = selectedOrders.length > 0 && selectedCustomerIds.length !== 1;

  const totalSelected = selectedOrders.reduce((sum, o) => sum + Number(o.price), 0);
  const totalTurnover = orders.reduce((sum, o) => sum + Number(o.price), 0);
  const activeOrders = orders.filter((o) => o.status === "draft" || o.status === "confirmed").length;
  const unpaidOrders = orders.filter((o) => o.paymentStatus === "unpaid").length;

  return (
    <Stack spacing={2.2}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
        <Box>
          <Typography className="page-title">Операции по заказам</Typography>
          <Typography variant="body2" className="page-subtitle" sx={{ mt: 0.6 }}>
            Контроль маршрутов, статусов и подготовка счета в пару кликов из выбранных позиций.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" disabled={selectedOrders.length === 0} onClick={clearSelection}>
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

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Заказов в выдаче</Typography>
            <Typography variant="h5" sx={{ mt: 0.6 }}>{orders.length}</Typography>
          </CardContent>
        </Card>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Активные статусы</Typography>
            <Typography variant="h5" sx={{ mt: 0.6 }}>{activeOrders}</Typography>
          </CardContent>
        </Card>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Не оплачено</Typography>
            <Typography variant="h5" sx={{ mt: 0.6 }}>{unpaidOrders}</Typography>
          </CardContent>
        </Card>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Общая сумма заказов</Typography>
            <Typography variant="h5" sx={{ mt: 0.6 }}>{formatAmount(totalTurnover)}</Typography>
          </CardContent>
        </Card>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Выбрано в счет</Typography>
            <Typography variant="h5" sx={{ mt: 0.6 }}>{selectedOrders.length}</Typography>
          </CardContent>
        </Card>
      </Stack>

      <Card className="surface-card">
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Клиент</InputLabel>
              <Select
                label="Клиент"
                value={customerId}
                onChange={(e) => setCustomerId(String(e.target.value))}
              >
                <MenuItem value="">Все клиенты</MenuItem>
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
                onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
              >
                <MenuItem value="">Все статусы</MenuItem>
                {ORDER_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {getOrderStatusMeta(s).label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Оплата</InputLabel>
              <Select
                label="Оплата"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus | "")}
              >
                <MenuItem value="">Все статусы оплаты</MenuItem>
                {PAYMENT_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {getPaymentStatusMeta(s).label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="date"
              label="Дата от"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="date"
              label="Дата до"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Divider className="soft-divider" sx={{ my: 2 }} />

          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.5}>
            <Typography>
              Выбрано: <b>{selectedOrders.length}</b> • Сумма: <b>{formatAmount(totalSelected)}</b>
            </Typography>
            <Button
              variant="contained"
              disabled={!canCreateInvoice || createInvoiceMut.isPending}
              onClick={() => {
                const cid = selectedCustomerIds[0];
                if (!cid) return;
                createInvoiceMut.mutate({
                  customerId: cid,
                  orderIds: selectedOrders.map((o) => o.id),
                  issueDate: todayYmd(),
                });
              }}
            >
              {createInvoiceMut.isPending ? "Формирование счета..." : "Создать счет по выбранным"}
            </Button>
          </Stack>

          {hasMixedCustomers && (
            <Alert severity="warning" sx={{ mt: 1.5 }}>
              Для формирования счета выберите заказы только одного клиента.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardContent>
          {isLoading && <CircularProgress />}
          {error && <Typography color="error">Ошибка загрузки заказов</Typography>}

          <Table size="small" className="data-table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Дата и время</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Маршрут</TableCell>
                <TableCell>Статусы</TableCell>
                <TableCell>Оплатить до</TableCell>
                <TableCell align="right">Сумма</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox checked={Boolean(selected[o.id])} onChange={() => toggle(o.id)} />
                  </TableCell>
                  <TableCell>{formatDateTime(o.pickupAt)}</TableCell>
                  <TableCell>{o.customer?.name || "—"}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{o.fromLocation} → {o.toLocation}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getVehicleTypeLabel(o.vehicleType)} • машин: {o.carsCount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
                      <OrderStatusChip status={o.status} />
                      <PaymentStatusChip status={o.paymentStatus} dueDate={o.paymentDueDate} />
                    </Stack>
                  </TableCell>
                  <TableCell>{formatDate(o.paymentDueDate)}</TableCell>
                  <TableCell align="right">{formatAmount(o.price)}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setEdit(o);
                        setDlgOpen(true);
                      }}
                    >
                      Изменить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!isLoading && orders.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              По выбранным фильтрам заказов не найдено.
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
