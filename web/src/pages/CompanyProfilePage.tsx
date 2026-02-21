import { useMutation, useQuery } from "@tanstack/react-query";
import { getCompanyProfile, upsertCompanyProfile } from "../api/endpoints";
import {
  Button, Card, CardContent, CircularProgress, Stack, TextField, Typography
} from "@mui/material";
import { useEffect, useState } from "react";

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

export function CompanyProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["company-profile"],
    queryFn: getCompanyProfile,
  });

  const [form, setForm] = useState<FormState>({
    companyName: "",
    address: "",
    taxId: "",
    website: "",
    bankName: "",
    iban: "",
    swift: "",
    notes: "",
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      companyName: data.companyName || "",
      address: data.address || "",
      taxId: data.taxId || "",
      website: data.website || "",
      bankName: data.bankName || "",
      iban: data.iban || "",
      swift: data.swift || "",
      notes: data.notes || "",
    });
  }, [data]);

  const mut = useMutation({
    mutationFn: () =>
      upsertCompanyProfile({
        companyName: form.companyName,
        address: form.address || undefined,
        taxId: form.taxId || undefined,
        website: form.website || undefined,
        bankName: form.bankName || undefined,
        iban: form.iban || undefined,
        swift: form.swift || undefined,
        notes: form.notes || undefined,
      } as any),
  });

  if (isLoading) return <CircularProgress />;

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Реквизиты компании</Typography>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField label="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <TextField label="Tax ID (TIN)" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} />
            <TextField label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <TextField label="Bank name" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
            <TextField label="IBAN" value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} />
            <TextField label="SWIFT" value={form.swift} onChange={(e) => setForm({ ...form, swift: e.target.value })} />
            <TextField label="Notes (будет в PDF)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} multiline minRows={2} />

            <Button
              variant="contained"
              disabled={!form.companyName || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mut.isPending ? "Сохраняю…" : "Сохранить"}
            </Button>

            {mut.isSuccess && <Typography color="success.main">Сохранено</Typography>}
            {mut.isError && <Typography color="error">Ошибка сохранения</Typography>}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}