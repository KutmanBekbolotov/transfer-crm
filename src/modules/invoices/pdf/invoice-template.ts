import type { Invoice } from '../invoice.entity';
import type { CompanyProfile } from '../../company/company-profile.entity';

function esc(s: unknown) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDateRu(value: unknown) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(d);
}

function formatMoneyRu(value: unknown) {
  const n = Number(value);
  if (Number.isNaN(n)) return String(value ?? '');
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatInvoiceStatus(status: unknown) {
  const normalized = String(status ?? '');
  switch (normalized) {
    case 'draft':
      return 'Черновик';
    case 'sent':
      return 'Отправлен';
    case 'paid':
      return 'Оплачен';
    case 'canceled':
      return 'Отменен';
    default:
      return normalized || '—';
  }
}

function localizeDescription(value: unknown) {
  const text = String(value ?? '');
  return text.replace(/^Transfer:\s*/i, 'Трансфер: ');
}

export function renderInvoiceHtml(params: {
  invoice: Invoice;
  company: CompanyProfile | null;
}) {
  const { invoice, company } = params;

  const companyName = company?.companyName ?? 'Название компании';
  const address = company?.address ?? '';
  const taxId = company?.taxId ?? '';
  const website = company?.website ?? '';
  const bankName = company?.bankName ?? '';
  const iban = company?.iban ?? '';
  const swift = company?.swift ?? '';
  const notes = company?.notes ?? '';

  const customerName = invoice.customer?.name ?? '';
  const contactPerson = (invoice.customer as any)?.contactPerson ?? '';
  const customerPhone = (invoice.customer as any)?.phone ?? '';
  const customerEmail = (invoice.customer as any)?.email ?? '';

  const issueDate = formatDateRu(invoice.issueDate);
  const dueDate = formatDateRu(invoice.dueDate);
  const paymentMethod = invoice.paymentMethod ?? '';
  const invoiceStatus = formatInvoiceStatus(invoice.status);
  const invoiceTotal = formatMoneyRu(invoice.total);

  const rows = (invoice.items ?? [])
    .map((it, idx) => {
      return `
      <tr>
        <td class="c">${idx + 1}</td>
        <td class="l">${esc(localizeDescription(it.description))}</td>
        <td class="c">${esc(it.qty)}</td>
        <td class="r">${esc(formatMoneyRu(it.unitPrice))}</td>
        <td class="r">${esc(formatMoneyRu(it.amount))}</td>
      </tr>
    `;
    })
    .join('');

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Счет ${esc(invoice.invoiceNo)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 24px; }
    .top { display: flex; justify-content: space-between; align-items: flex-start; }
    .brand h1 { margin: 0 0 6px 0; font-size: 20px; letter-spacing: 0.2px; }
    .muted { color: #555; }
    .box { border: 1px solid #ddd; padding: 10px; border-radius: 6px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
    .kv { width: 100%; border-collapse: collapse; }
    .kv td { padding: 3px 0; vertical-align: top; }
    .kv td:first-child { width: 140px; color: #444; }
    .title { margin: 18px 0 8px; font-size: 18px; font-weight: 700; }
    table.items { width: 100%; border-collapse: collapse; margin-top: 10px; }
    table.items th, table.items td { border: 1px solid #ddd; padding: 8px; }
    table.items th { background: #f5f5f5; font-weight: 700; }
    .r { text-align: right; }
    .c { text-align: center; }
    .l { text-align: left; }
    .total { margin-top: 10px; display:flex; justify-content: flex-end; }
    .total .line { width: 320px; border: 1px solid #ddd; border-radius: 6px; padding: 10px; }
    .total-row { display:flex; justify-content: space-between; font-size: 14px; font-weight: 700; }
    .section { margin-top: 14px; }
    .small { font-size: 11px; }
  </style>
</head>
<body>
  <div class="top">
    <div class="brand">
      <h1>${esc(companyName)}</h1>
      <div class="muted">${esc(address)}</div>
      ${taxId ? `<div class="muted">ИНН: ${esc(taxId)}</div>` : ``}
      ${website ? `<div class="muted">${esc(website)}</div>` : ``}
    </div>

    <div class="box" style="min-width: 320px;">
      <table class="kv">
        <tr><td>Номер счета:</td><td><b>${esc(invoice.invoiceNo)}</b></td></tr>
        <tr><td>Дата выставления:</td><td>${esc(issueDate || '—')}</td></tr>
        ${dueDate ? `<tr><td>Срок оплаты:</td><td>${esc(dueDate)}</td></tr>` : ``}
        ${paymentMethod ? `<tr><td>Способ оплаты:</td><td>${esc(paymentMethod)}</td></tr>` : ``}
        <tr><td>Статус:</td><td>${esc(invoiceStatus)}</td></tr>
      </table>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <div class="small muted">Заказчик</div>
      <div style="margin-top:6px;"><b>${esc(customerName)}</b></div>
      ${contactPerson ? `<div>Контакт: ${esc(contactPerson)}</div>` : ``}
      ${customerPhone ? `<div>Телефон: ${esc(customerPhone)}</div>` : ``}
      ${customerEmail ? `<div>Эл. почта: ${esc(customerEmail)}</div>` : ``}
    </div>

    <div class="box">
      <div class="small muted">Услуги</div>
      <div style="margin-top:6px;">Транспортные трансферные услуги</div>
    </div>
  </div>

  <div class="title">СЧЕТ НА ОПЛАТУ</div>

  <table class="items">
    <thead>
      <tr>
        <th style="width:40px;" class="c">№</th>
        <th class="l">Описание</th>
        <th style="width:60px;" class="c">Кол-во</th>
        <th style="width:120px;" class="r">Цена</th>
        <th style="width:120px;" class="r">Сумма</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td class="c">1</td><td class="l">—</td><td class="c">1</td><td class="r">0,00</td><td class="r">0,00</td></tr>`}
    </tbody>
  </table>

  <div class="total">
    <div class="line">
      <div class="total-row">
        <div>ИТОГО</div>
        <div>${esc(invoiceTotal)}</div>
      </div>
    </div>
  </div>

  <div class="section box">
    <div class="small muted">Банковские реквизиты</div>
    <div style="margin-top:6px;">
      ${bankName ? `<div><b>Банк:</b> ${esc(bankName)}</div>` : ``}
      ${iban ? `<div><b>IBAN:</b> ${esc(iban)}</div>` : ``}
      ${swift ? `<div><b>SWIFT:</b> ${esc(swift)}</div>` : ``}
      ${notes ? `<div style="margin-top:8px;" class="muted">${esc(notes)}</div>` : ``}
    </div>
  </div>
</body>
</html>
  `;
}
