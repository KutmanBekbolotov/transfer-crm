import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InvoicesService } from '../invoices.service';
import { CompanyProfileService } from '../../company/company-profile.service';
import { renderInvoiceHtml } from './invoice-template';
import puppeteer from 'puppeteer';
import * as fs from 'node:fs';

function resolveChromeExecutablePath(): string | undefined {
  const fromEnv = process.env.CHROME_PATH?.trim();
  if (fromEnv) return fromEnv;

  const candidates = [
    '/opt/google/chrome/chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',

    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',

    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  return candidates.find((path) => fs.existsSync(path));
}

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

    const executablePath = resolveChromeExecutablePath();
    let browser: Awaited<ReturnType<typeof puppeteer.launch>>;
    try {
      browser = await puppeteer.launch({
        headless: true,
        ...(executablePath ? { executablePath } : { channel: 'chrome' }),
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to launch Google Chrome for PDF generation. Set CHROME_PATH to your Chrome binary path. Details: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

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
