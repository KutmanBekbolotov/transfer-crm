import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoicesService } from '../invoices.service';
import { CompanyProfileService } from '../../company/company-profile.service';
import { renderInvoiceHtml } from './invoice-template';
import puppeteer from 'puppeteer';

@Injectable()
export class InvoicePdfService {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly companyService: CompanyProfileService,
  ) {}

  async generatePdfBuffer(invoiceId: string): Promise<Buffer> {
    const invoice = await this.invoicesService.findOne(invoiceId);
    if (!invoice) throw new NotFoundException('Invoice not found');

    const company = await this.companyService.getOne();

    const html = renderInvoiceHtml({ invoice, company });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}
