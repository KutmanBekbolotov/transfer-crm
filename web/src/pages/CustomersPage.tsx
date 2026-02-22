import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCustomer, getCustomers, updateCustomer, type Customer } from "../api/endpoints";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CustomerDialog } from "../ui/CustomerDialog";

type CustomerUpdatePayload = Partial<{
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}>;

export function CustomersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [dlgOpen, setDlgOpen] = useState(false);
  const [edit, setEdit] = useState<Customer | null>(null);

  const queryKey = useMemo(() => ["customers", q], [q]);
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getCustomers(q.trim() || undefined),
  });

  const createMut = useMutation({
    mutationFn: createCustomer,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CustomerUpdatePayload }) => updateCustomer(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const customers = data || [];
  const withContacts = customers.filter((c) => c.contactPerson || c.phone || c.email).length;
  const withAddress = customers.filter((c) => c.address).length;

  return (
    <Stack spacing={2.2}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
        <Box>
          <Typography className="page-title">Клиентская база</Typography>
          <Typography variant="body2" className="page-subtitle" sx={{ mt: 0.6 }}>
            Единый каталог клиентов для заказов и выставления счетов. Чем полнее карточки, тем быстрее работа команды.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            setEdit(null);
            setDlgOpen(true);
          }}
        >
          Добавить клиента
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Всего клиентов
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.6 }}>
              {customers.length}
            </Typography>
          </CardContent>
        </Card>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              С контактами
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.6 }}>
              {withContacts}
            </Typography>
          </CardContent>
        </Card>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              С заполненным адресом
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.6 }}>
              {withAddress}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <Card className="surface-card">
        <CardContent>
          <TextField
            fullWidth
            label="Поиск по базе"
            placeholder="Имя, телефон или электронная почта"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardContent>
          {isLoading && <CircularProgress />}
          {error && <Typography color="error">Ошибка загрузки</Typography>}

          {customers.map((c) => (
            <div key={c.id}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={1.5}
              >
                <div>
                  <Typography variant="subtitle1" fontWeight={700}>{c.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.contactPerson ? `Контакт: ${c.contactPerson} • ` : ""}
                    {c.phone ? `Телефон: ${c.phone} • ` : ""}
                    {c.email ? `Почта: ${c.email}` : ""}
                  </Typography>
                  {c.address && (
                    <Typography variant="body2" color="text.secondary">
                      Адрес: {c.address}
                    </Typography>
                  )}
                </div>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEdit(c);
                    setDlgOpen(true);
                  }}
                >
                  Редактировать
                </Button>
              </Stack>
              <Divider className="soft-divider" sx={{ my: 1.5 }} />
            </div>
          ))}

          {!isLoading && (data?.length ?? 0) === 0 && (
            <Typography color="text.secondary">Клиенты не найдены по текущему фильтру</Typography>
          )}
        </CardContent>
      </Card>

      <CustomerDialog
        open={dlgOpen}
        mode={edit ? "edit" : "create"}
        initial={edit}
        onClose={() => setDlgOpen(false)}
        onSubmit={async (payload) => {
          if (!edit) {
            await createMut.mutateAsync(payload);
          } else {
            await updateMut.mutateAsync({ id: edit.id, payload });
          }
        }}
      />
    </Stack>
  );
}
