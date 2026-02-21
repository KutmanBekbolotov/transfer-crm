export function makeInvoiceNo(prefix = 'TY') {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${y}${m}${day}-${rnd}`;
}