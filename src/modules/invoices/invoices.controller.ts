import { Body, Controller, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoicePdfService } from './pdf/invoice-pdf.service';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly service: InvoicesService,
    private readonly pdfService: InvoicePdfService,
  ) {}

  @Post()
  create(@Body() dto: CreateInvoiceDto) {
    return this.service.createFromOrders(dto);
  }

  @Get()
  findAll(@Query('customerId') customerId?: string) {
    return this.service.findAll(customerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  setStatus(
    @Param('id') id: string,
    @Body() body: { status: 'draft' | 'sent' | 'paid' | 'canceled' },
  ) {
    return this.service.setStatus(id, body.status);
  }

  @Get(':id/pdf')
  async pdf(@Param('id') id: string, @Res() res: Response) {
    const buf = await this.pdfService.generatePdfBuffer(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${id}.pdf"`);
    return res.send(buf);
  }
}