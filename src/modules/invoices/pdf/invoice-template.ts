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

export function renderInvoiceHtml(params: {
  invoice: Invoice;
  company: CompanyProfile | null;
}) {
  const { invoice, company } = params;

  const companyName = company?.companyName ?? 'Company Name';
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

  const issueDate = invoice.issueDate ?? '';
  const dueDate = invoice.dueDate ?? '';
  const paymentMethod = invoice.paymentMethod ?? '';

  const rows = (invoice.items ?? []).map((it, idx) => {
    return `
      <tr>
        <td class="c">${idx + 1}</td>
        <td class="l">${esc(it.description)}</td>
        <td class="c">${esc(it.qty)}</td>
        <td class="r">${esc(it.unitPrice)}</td>
        <td class="r">${esc(it.amount)}</td>
      </tr>
    `;
  }).join('');

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${esc(invoice.invoiceNo)}</title>
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
    .sign { margin-top: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .small { font-size: 11px; }
  </style>
</head>
<body>
  <div class="top">
    <div class="brand">
      <h1>${esc(companyName)}</h1>
      <div class="muted">${esc(address)}</div>
      ${taxId ? `<div class="muted">TIN: ${esc(taxId)}</div>` : ``}
      ${website ? `<div class="muted">${esc(website)}</div>` : ``}
    </div>

    <div class="box" style="min-width: 320px;">
      <table class="kv">
        <tr><td>Invoice No:</td><td><b>${esc(invoice.invoiceNo)}</b></td></tr>
        <tr><td>Issue date:</td><td>${esc(issueDate)}</td></tr>
        ${dueDate ? `<tr><td>Due date:</td><td>${esc(dueDate)}</td></tr>` : ``}
        ${paymentMethod ? `<tr><td>Payment method:</td><td>${esc(paymentMethod)}</td></tr>` : ``}
        <tr><td>Status:</td><td>${esc(invoice.status)}</td></tr>
      </table>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <div class="small muted">Bill To</div>
      <div style="margin-top:6px;"><b>${esc(customerName)}</b></div>
      ${contactPerson ? `<div>${esc(contactPerson)}</div>` : ``}
      ${customerPhone ? `<div>${esc(customerPhone)}</div>` : ``}
      ${customerEmail ? `<div>${esc(customerEmail)}</div>` : ``}
    </div>

    <div class="box">
      <div class="small muted">Service</div>
      <div style="margin-top:6px;">Tour transfer services</div>
    </div>
  </div>

  <div class="title">INVOICE</div>

  <table class="items">
    <thead>
      <tr>
        <th style="width:40px;" class="c">#</th>
        <th class="l">Description</th>
        <th style="width:60px;" class="c">Qty</th>
        <th style="width:120px;" class="r">Unit price</th>
        <th style="width:120px;" class="r">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td class="c">1</td><td class="l">—</td><td class="c">1</td><td class="r">0.00</td><td class="r">0.00</td></tr>`}
    </tbody>
  </table>

  <div class="total">
    <div class="line">
      <div class="total-row">
        <div>TOTAL</div>
        <div>${esc(invoice.total)}</div>
      </div>
    </div>
  </div>

  <div class="section box">
    <div class="small muted">Bank details</div>
    <div style="margin-top:6px;">
      ${bankName ? `<div><b>Bank:</b> ${esc(bankName)}</div>` : ``}
      ${iban ? `<div><b>IBAN:</b> ${esc(iban)}</div>` : ``}
      ${swift ? `<div><b>SWIFT:</b> ${esc(swift)}</div>` : ``}
      ${notes ? `<div style="margin-top:8px;" class="muted">${esc(notes)}</div>` : ``}
    </div>
  </div>

  <div class="sign">
    <div class="box">
      <div class="small muted">Prepared by</div>
      <div style="margin-top:18px;">________________________</div>
      <div class="muted small">Signature</div>
    </div>
    <div class="box">
      <div class="small muted">Received by</div>
      <div style="margin-top:18px;">________________________</div>
      <div class="muted small">Signature</div>
    </div>
  </div>
</body>
</html>
  `;
}