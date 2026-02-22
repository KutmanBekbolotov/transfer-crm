import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getInvoice, invoicePdfUrl, setInvoiceStatus, type InvoiceStatus } from "../api/endpoints";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { InvoiceStatusChip } from "../ui/StatusChip";
import { formatAmount, formatDate } from "../ui/format";

export function InvoicePage() {
  const qc = useQueryClient();
  const { id } = useParams();
  const invoiceId = id || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => getInvoice(invoiceId),
    enabled: Boolean(invoiceId),
  });

  const statusMut = useMutation({
    mutationFn: (status: InvoiceStatus) => setInvoiceStatus(invoiceId, status),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["invoice", invoiceId] });
    },
  });

  if (isLoading) return <CircularProgress />;
  if (error || !data) return <Typography color="error">Не удалось загрузить счет.</Typography>;

  const setStatus = (s: InvoiceStatus) => statusMut.mutate(s);

  return (
    <Stack spacing={2.2}>
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography className="page-title">Счет № {data.invoiceNo}</Typography>
          <Typography variant="body2" className="page-subtitle" sx={{ mt: 0.6 }}>
            Клиент: {data.customer.name}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <InvoiceStatusChip status={data.status} />
          <Button variant="outlined" href={invoicePdfUrl(data.id)} target="_blank" rel="noreferrer">
            Открыть PDF
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Дата выставления</Typography>
            <Typography variant="h6" sx={{ mt: 0.6 }}>{formatDate(data.issueDate)}</Typography>
          </CardContent>
        </Card>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Срок оплаты</Typography>
            <Typography variant="h6" sx={{ mt: 0.6 }}>{formatDate(data.dueDate)}</Typography>
          </CardContent>
        </Card>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Позиций в счете</Typography>
            <Typography variant="h6" sx={{ mt: 0.6 }}>{data.items.length}</Typography>
          </CardContent>
        </Card>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Итоговая сумма</Typography>
            <Typography variant="h6" sx={{ mt: 0.6 }}>{formatAmount(data.total)}</Typography>
          </CardContent>
        </Card>
      </Stack>

      <Card className="surface-card">
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography fontWeight={700}>{data.customer.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Дата выставления: {formatDate(data.issueDate)}
                {data.dueDate ? ` • Срок оплаты: ${formatDate(data.dueDate)}` : ""}
                {data.paymentMethod ? ` • Оплата: ${data.paymentMethod}` : ""}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Изменить статус счета
              </Typography>
              <ButtonGroup variant="outlined" size="small" disabled={statusMut.isPending}>
                <Button onClick={() => setStatus("sent")} disabled={data.status === "sent"}>Отправлен</Button>
                <Button onClick={() => setStatus("paid")} disabled={data.status === "paid"}>Оплачен</Button>
                <Button onClick={() => setStatus("canceled")} disabled={data.status === "canceled"}>Отменен</Button>
              </ButtonGroup>
            </Box>
          </Stack>

          <Divider className="soft-divider" sx={{ my: 2 }} />

          {(data.items || []).map((it) => (
            <Box key={it.id} sx={{ py: 1.2 }}>
              <Typography fontWeight={700}>{it.description}</Typography>
              <Typography variant="body2" color="text.secondary">
                Кол-во: {it.qty} • Цена: {formatAmount(it.unitPrice)} • Сумма: {formatAmount(it.amount)}
              </Typography>
              <Divider className="soft-divider" sx={{ mt: 1.2 }} />
            </Box>
          ))}

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Typography variant="h6">ИТОГО: {formatAmount(data.total)}</Typography>
          </Stack>

          {statusMut.isError && (
            <Typography color="error" sx={{ mt: 1 }}>
              Не удалось сменить статус счета.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
