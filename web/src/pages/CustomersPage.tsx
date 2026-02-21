import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCustomer, getCustomers, updateCustomer, type Customer } from "../api/endpoints";
import {
  Button, Card, CardContent, CircularProgress, Divider,
  Stack, TextField, Typography
} from "@mui/material";
import { CustomerDialog } from "../ui/CustomerDialog";

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
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateCustomer(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography variant="h5">Клиенты</Typography>
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

      <Card>
        <CardContent>
          <TextField
            fullWidth
            label="Поиск (имя/телефон/email)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading && <CircularProgress />}
          {error && <Typography color="error">Ошибка загрузки</Typography>}

          {(data || []).map((c) => (
            <div key={c.id}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <div>
                  <Typography variant="subtitle1" fontWeight={700}>{c.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.contactPerson ? `Контакт: ${c.contactPerson} • ` : ""}
                    {c.phone ? `Тел: ${c.phone} • ` : ""}
                    {c.email ? `Email: ${c.email}` : ""}
                  </Typography>
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
              <Divider sx={{ my: 1.5 }} />
            </div>
          ))}

          {!isLoading && (data?.length ?? 0) === 0 && (
            <Typography color="text.secondary">Пока пусто</Typography>
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