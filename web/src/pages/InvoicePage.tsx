import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getInvoice, invoicePdfUrl, setInvoiceStatus, type InvoiceStatus } from "../api/endpoints";
import {
  Card, CardContent, CircularProgress, Divider, Stack, Typography, Button, ButtonGroup
} from "@mui/material";
import { useParams } from "react-router-dom";

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
  if (error || !data) return <Typography color="error">Не удалось загрузить счет</Typography>;

  const setStatus = (s: InvoiceStatus) => statusMut.mutate(s);

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} alignItems="center" justifyContent="space-between" spacing={2}>
        <Typography variant="h5">Invoice {data.invoiceNo}</Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" href={invoicePdfUrl(data.id)} target="_blank" rel="noreferrer">
            Открыть PDF
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <div>
              <Typography fontWeight={700}>{data.customer.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Issue: {data.issueDate}
                {data.dueDate ? ` • Due: ${data.dueDate}` : ""}
                {data.paymentMethod ? ` • ${data.paymentMethod}` : ""}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: <b>{data.status}</b>
              </Typography>
            </div>

            <div>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Статус счета
              </Typography>
              <ButtonGroup variant="outlined" size="small" disabled={statusMut.isPending}>
                <Button onClick={() => setStatus("sent")} disabled={data.status === "sent"}>sent</Button>
                <Button onClick={() => setStatus("paid")} disabled={data.status === "paid"}>paid</Button>
                <Button onClick={() => setStatus("canceled")} disabled={data.status === "canceled"}>canceled</Button>
              </ButtonGroup>
            </div>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {(data.items || []).map((it) => (
            <div key={it.id} style={{ padding: "8px 0" }}>
              <Typography fontWeight={700}>{it.description}</Typography>
              <Typography variant="body2" color="text.secondary">
                Qty: {it.qty} • Unit: {it.unitPrice} • Amount: {it.amount}
              </Typography>
              <Divider sx={{ mt: 1.5 }} />
            </div>
          ))}

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Typography variant="h6">TOTAL: {data.total}</Typography>
          </Stack>

          {statusMut.isError && (
            <Typography color="error" sx={{ mt: 1 }}>
              Не удалось сменить статус
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}