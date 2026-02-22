import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Invoice } from '../invoice.entity';
import type { CompanyProfile } from '../../company/company-profile.entity';

let cachedLogoDataUri: string | null | undefined;

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

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

function formatMoneyRu(value: unknown) {
  const n = Number(value);
  if (Number.isNaN(n)) return String(value ?? '');
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function logoMimeType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

function resolveLogoDataUri() {
  if (cachedLogoDataUri !== undefined) return cachedLogoDataUri;

  const candidates = ['logo.JPG', 'logo.jpg', 'logo.jpeg', 'logo.png', 'logo.webp', 'logo.svg'];
  for (const candidate of candidates) {
    const abs = path.resolve(process.cwd(), candidate);
    if (!fs.existsSync(abs)) continue;

    try {
      const buf = fs.readFileSync(abs);
      const mime = logoMimeType(candidate);
      cachedLogoDataUri = `data:${mime};base64,${buf.toString('base64')}`;
      return cachedLogoDataUri;
    } catch {
    }
  }

  cachedLogoDataUri = null;
  return cachedLogoDataUri;
}

function normalizeItemDescription(value: unknown) {
  const text = String(value ?? '').trim();
  if (!text) return '—';
  if (/^трансфер/i.test(text)) {
    return text.replace(/^трансфер/i, 'трансфер');
  }
  return text;
}

export function renderInvoiceHtml(params: {
  invoice: Invoice;
  company: CompanyProfile | null;
}) {
  const { invoice, company } = params;
  const logoDataUri = resolveLogoDataUri();

  const companyName = company?.companyName?.trim() || 'ОсОО «Байсал Тревел»';
  const address = company?.address?.trim() || '';
  const taxId = company?.taxId?.trim() || '';
  const bankName = company?.bankName?.trim() || '';
  const iban = company?.iban?.trim() || '';
  const swift = company?.swift?.trim() || '';
  const website = company?.website?.trim() || '';
  const notes = company?.notes?.trim() || '';

  const customerName = invoice.customer?.name?.trim() || '—';
  const contactPerson = (invoice.customer as any)?.contactPerson?.trim?.() || '';
  const customerPhone = (invoice.customer as any)?.phone?.trim?.() || '';
  const customerEmail = (invoice.customer as any)?.email?.trim?.() || '';

  const issueDate = formatDateRu(invoice.issueDate) || '—';
  const dueDate = formatDateRu(invoice.dueDate) || '—';
  const paymentMethod = String(invoice.paymentMethod ?? '').trim() || 'Перечислением';
  const total = formatMoneyRu(invoice.total);

  const rows = (invoice.items ?? [])
    .map((it) => {
      const qty = Number(it.qty || 0) || 1;
      const description = normalizeItemDescription(it.description);
      const unitPrice = formatMoneyRu(it.unitPrice);
      const amount = formatMoneyRu(it.amount);

      return `
        <tr>
          <td class="c">${esc(qty)}</td>
          <td class="l">${esc(description)}</td>
          <td class="r">${esc(unitPrice)}</td>
          <td class="r">${esc(amount)}</td>
        </tr>
      `;
    })
    .join('');

  const officeLines = [address, website, notes].filter(Boolean);

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Счет к оплате № ${esc(invoice.invoiceNo)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      color: #111;
      background: #fff;
      font-size: 14px;
      line-height: 1.35;
    }
    .page {
      width: 1020px;
      margin: 22px auto 30px;
    }
    .top {
      display: grid;
      grid-template-columns: 240px 1fr 140px;
      gap: 14px;
      align-items: start;
      min-height: 126px;
    }
    .logo-wrap {
      width: 220px;
      min-height: 120px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    .logo {
      max-width: 220px;
      max-height: 118px;
      object-fit: contain;
    }
    .company-head {
      text-align: center;
      font-size: 15px;
      line-height: 1.35;
      padding-top: 10px;
    }
    .issue-date {
      text-align: right;
      font-size: 38px;
      font-weight: 700;
      padding-top: 90px;
      white-space: nowrap;
    }
    .title {
      text-align: center;
      font-size: 45px;
      font-weight: 700;
      margin: 56px 0 48px;
    }
    .party {
      margin: 0 0 28px 0;
      font-size: 16px;
    }
    .party-row {
      display: flex;
      align-items: baseline;
      gap: 20px;
      margin-top: 9px;
    }
    .party-row .label {
      width: 200px;
      color: #222;
    }
    .party-row .value {
      font-weight: 700;
    }
    .table-wrap {
      margin-top: 20px;
    }
    table.items {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 16px;
    }
    table.items th,
    table.items td {
      border: 3px solid #111;
      padding: 13px 14px;
      vertical-align: middle;
    }
    table.items th {
      background: #efefef;
      font-weight: 700;
      text-align: center;
    }
    table.items th:nth-child(1) { width: 14%; }
    table.items th:nth-child(2) { width: 58%; }
    table.items th:nth-child(3) { width: 13.5%; }
    table.items th:nth-child(4) { width: 14.5%; }
    .c { text-align: center; }
    .r { text-align: right; }
    .l { text-align: left; }
    .total-row td {
      font-weight: 700;
      background: #fafafa;
    }
    .total-label {
      text-align: right;
      font-weight: 700;
    }
    .note {
      margin-top: 42px;
      text-align: center;
      font-size: 16px;
      line-height: 1.45;
    }
    .note .thanks {
      margin-top: 8px;
      font-size: 18px;
      font-weight: 700;
    }
    .bank {
      margin-top: 34px;
      font-size: 16px;
      line-height: 1.42;
    }
    .bank .warn {
      margin-top: 24px;
    }
    .contacts {
      margin-top: 82px;
      font-size: 16px;
      line-height: 1.45;
    }
    .contact-row {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 26px;
      margin-bottom: 16px;
      align-items: start;
    }
    .contact-value b {
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="top">
      <div class="logo-wrap">
        ${logoDataUri ? `<img class="logo" src="${logoDataUri}" alt="logo" />` : ``}
      </div>
      <div class="company-head">
        <div>${esc(companyName)}</div>
        ${address ? `<div>${esc(address)}</div>` : ``}
        ${taxId ? `<div>ИНН ${esc(taxId)}</div>` : ``}
      </div>
      <div class="issue-date">${esc(issueDate)}</div>
    </div>

    <div class="title">Счет к оплате № ${esc(invoice.invoiceNo)}</div>

    <div class="party">
      <div class="party-row">
        <div class="label">Кому:</div>
        <div class="value">${esc(customerName)}</div>
      </div>
      <div class="party-row">
        <div class="label">Срок оплаты:</div>
        <div>${esc(dueDate)}</div>
      </div>
      <div class="party-row">
        <div class="label">Форма оплаты:</div>
        <div>${esc(paymentMethod)}</div>
      </div>
    </div>

    <div class="table-wrap">
      <table class="items">
        <thead>
          <tr>
            <th>Количество</th>
            <th>Описание</th>
            <th>Цена за единицу, сом</th>
            <th>Сумма, сом</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows ||
            `<tr><td class="c">1</td><td class="l">—</td><td class="r">0,00</td><td class="r">0,00</td></tr>`
          }
          <tr class="total-row">
            <td></td>
            <td class="total-label">ИТОГО:</td>
            <td></td>
            <td class="r">${esc(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="note">
      <div>Если у Вас возникли какие-либо вопросы касательно данного счета,</div>
      <div>пожалуйста звоните Байсал Тревел.</div>
      <div class="thanks">БЛАГОДАРИМ ЗА СОТРУДНИЧЕСТВО!</div>
    </div>

    <div class="bank">
      <div>Получатель: ${esc(companyName)}</div>
      ${bankName ? `<div>Банк Получателя: ${esc(bankName)}</div>` : ``}
      ${iban ? `<div>Расчетный счет: ${esc(iban)}</div>` : ``}
      ${swift ? `<div>БИК: ${esc(swift)}</div>` : ``}
      <div class="warn">Все банковские расходы оплачивает отправитель!</div>
    </div>

    <div class="contacts">
      <div class="contact-row">
        <div>Контактное лицо</div>
        <div class="contact-value"><b>${esc(contactPerson || customerName)}</b></div>
      </div>
      <div class="contact-row">
        <div>Офис, выписавший инвойс</div>
        <div class="contact-value">
          ${officeLines.map((line) => esc(line)).join('<br/>') || '—'}
          ${customerPhone ? `<br/>Тел.: ${esc(customerPhone)}` : ``}
          ${customerEmail ? `<br/>${esc(customerEmail)}` : ``}
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
