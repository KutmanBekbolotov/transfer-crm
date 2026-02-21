import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Customer } from '../customers/customer.entity';
import { Order } from '../orders/order.entity';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoicePdfService } from './pdf/invoice-pdf.service';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem, Customer, Order]), CompanyModule],
  providers: [InvoicesService, InvoicePdfService],
  controllers: [InvoicesController],
})
export class InvoicesModule {}
