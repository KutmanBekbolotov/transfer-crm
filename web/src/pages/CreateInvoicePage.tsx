import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createInvoice, getCustomers, getOrders } from "../api/endpoints";
import type { Order } from "../api/endpoints";
import {
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
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatAmount, formatDate, formatDateTime, getVehicleTypeLabel } from "../ui/format";
import { OrderStatusChip, PaymentStatusChip } from "../ui/StatusChip";

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

  const selectedTotal = (orders || [])
    .filter((o) => selected[o.id])
    .reduce((sum, o) => sum + Number(o.price), 0);

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
    <Stack spacing={2.2}>
      <Box>
        <Typography className="page-title">Создание счета</Typography>
        <Typography variant="body2" className="page-subtitle" sx={{ mt: 0.6 }}>
          Выберите клиента, отметьте нужные заказы и сформируйте счет с готовым PDF.
        </Typography>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Выбрано заказов</Typography>
            <Typography variant="h5" sx={{ mt: 0.6 }}>{selectedOrderIds.length}</Typography>
          </CardContent>
        </Card>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Сумма к выставлению</Typography>
            <Typography variant="h5" sx={{ mt: 0.6 }}>{formatAmount(selectedTotal)}</Typography>
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
                onChange={(e) => {
                  setCustomerId(String(e.target.value));
                  setSelected({});
                }}
              >
                <MenuItem value="">Выберите клиента</MenuItem>
                {(customers || []).map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="date"
              label="Дата выставления"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="date"
              label="Срок оплаты"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Способ оплаты"
              placeholder="Например: банковский перевод"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </Stack>

          <Divider className="soft-divider" sx={{ my: 2 }} />

          {!customerId && (
            <Typography color="text.secondary">Сначала выберите клиента, чтобы показать связанные заказы.</Typography>
          )}

          {ordersLoading && <CircularProgress />}

          {(orders || []).map((o) => (
            <Card key={o.id} className="surface-card metric-card" sx={{ mb: 1.2 }}>
              <CardContent sx={{ py: "12px !important" }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={1}
                >
                  <Stack direction="row" alignItems="center" spacing={1.2}>
                    <Checkbox checked={Boolean(selected[o.id])} onChange={() => toggle(o)} />
                    <Box>
                      <Typography fontWeight={700}>{o.fromLocation} → {o.toLocation}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(o.pickupAt)} • {getVehicleTypeLabel(o.vehicleType)} • машин: {o.carsCount}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <OrderStatusChip status={o.status} />
                    <PaymentStatusChip status={o.paymentStatus} dueDate={o.paymentDueDate} />
                    <Typography variant="caption" color="text.secondary">
                      до {formatDate(o.paymentDueDate)}
                    </Typography>
                    <Typography fontWeight={700}>{formatAmount(o.price)}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}

          {customerId && (orders?.length ?? 0) === 0 && !ordersLoading && (
            <Typography color="text.secondary">У выбранного клиента пока нет заказов.</Typography>
          )}

          <Divider className="soft-divider" sx={{ my: 2 }} />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
            <Typography>
              Позиции: <b>{selectedOrderIds.length}</b> • Итого: <b>{formatAmount(selectedTotal)}</b>
            </Typography>

            <Button
              variant="contained"
              disabled={!customerId || selectedOrderIds.length === 0 || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mut.isPending ? "Создаем счет..." : "Создать счет"}
            </Button>
          </Stack>

          {mut.isError && (
            <Typography color="error" sx={{ mt: 1 }}>
              Не удалось создать счет.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
