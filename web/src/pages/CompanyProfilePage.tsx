import { useMutation, useQuery } from "@tanstack/react-query";
import { getCompanyProfile, upsertCompanyProfile, type CompanyProfile } from "../api/endpoints";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

type FormState = {
  companyName: string;
  address: string;
  taxId: string;
  website: string;
  bankName: string;
  iban: string;
  swift: string;
  notes: string;
};

const FIELDS: Array<keyof FormState> = [
  "companyName",
  "address",
  "taxId",
  "website",
  "bankName",
  "iban",
  "swift",
  "notes",
];

const EMPTY_FORM: FormState = {
  companyName: "",
  address: "",
  taxId: "",
  website: "",
  bankName: "",
  iban: "",
  swift: "",
  notes: "",
};

function profileToForm(profile?: CompanyProfile | null): FormState {
  if (!profile) return EMPTY_FORM;
  return {
    companyName: profile.companyName || "",
    address: profile.address || "",
    taxId: profile.taxId || "",
    website: profile.website || "",
    bankName: profile.bankName || "",
    iban: profile.iban || "",
    swift: profile.swift || "",
    notes: profile.notes || "",
  };
}

export function CompanyProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["company-profile"],
    queryFn: getCompanyProfile,
  });

  const [draft, setDraft] = useState<Partial<FormState>>({});
  const form = useMemo<FormState>(() => ({ ...profileToForm(data), ...draft }), [data, draft]);

  const mut = useMutation({
    mutationFn: () => {
      const payload: Parameters<typeof upsertCompanyProfile>[0] = {
        companyName: form.companyName,
        address: form.address || undefined,
        taxId: form.taxId || undefined,
        website: form.website || undefined,
        bankName: form.bankName || undefined,
        iban: form.iban || undefined,
        swift: form.swift || undefined,
        notes: form.notes || undefined,
      };
      return upsertCompanyProfile(payload);
    },
  });

  const fillProgress = useMemo(() => {
    const filled = FIELDS.filter((key) => form[key].trim()).length;
    return Math.round((filled / FIELDS.length) * 100);
  }, [form]);

  if (isLoading) return <CircularProgress />;

  return (
    <Stack spacing={2.2}>
      <Box>
        <Typography className="page-title">Реквизиты компании</Typography>
        <Typography variant="body2" className="page-subtitle" sx={{ mt: 0.6 }}>
          Эти данные автоматически подставляются в PDF-счет. Полнота профиля влияет на качество документов.
        </Typography>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Заполненность профиля</Typography>
            <Typography variant="h5" sx={{ mt: 0.6 }}>{fillProgress}%</Typography>
          </CardContent>
        </Card>
        <Card className="surface-card metric-card" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Основной блок</Typography>
            <Typography variant="h6" sx={{ mt: 0.6 }}>
              {form.companyName ? "Готов" : "Нужно заполнить"}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <Card className="surface-card">
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Название компании"
              value={form.companyName}
              onChange={(e) => setDraft((prev) => ({ ...prev, companyName: e.target.value }))}
              required
            />
            <TextField
              label="Юридический адрес"
              value={form.address}
              onChange={(e) => setDraft((prev) => ({ ...prev, address: e.target.value }))}
            />
            <TextField
              label="ИНН / Налоговый идентификатор"
              value={form.taxId}
              onChange={(e) => setDraft((prev) => ({ ...prev, taxId: e.target.value }))}
            />
            <TextField
              label="Сайт компании"
              value={form.website}
              onChange={(e) => setDraft((prev) => ({ ...prev, website: e.target.value }))}
            />
            <TextField
              label="Банк"
              value={form.bankName}
              onChange={(e) => setDraft((prev) => ({ ...prev, bankName: e.target.value }))}
            />
            <TextField
              label="IBAN (номер счета)"
              value={form.iban}
              onChange={(e) => setDraft((prev) => ({ ...prev, iban: e.target.value }))}
            />
            <TextField
              label="SWIFT (код банка)"
              value={form.swift}
              onChange={(e) => setDraft((prev) => ({ ...prev, swift: e.target.value }))}
            />
            <TextField
              label="Примечания для счета PDF"
              value={form.notes}
              onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))}
              multiline
              minRows={2}
            />

            <Button
              variant="contained"
              disabled={!form.companyName.trim() || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mut.isPending ? "Сохраняем..." : "Сохранить реквизиты"}
            </Button>

            {mut.isSuccess && <Typography color="success.main">Изменения сохранены.</Typography>}
            {mut.isError && <Typography color="error">Ошибка сохранения реквизитов.</Typography>}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
