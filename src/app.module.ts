import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { InvoicesModule } from './modules/invoices/invoices.module';

import { Customer } from './modules/customers/customer.entity';
import { Order } from './modules/orders/order.entity';
import { Invoice } from './modules/invoices/invoice.entity';
import { InvoiceItem } from './modules/invoices/invoice-item.entity';
import { CompanyProfile } from './modules/company/company-profile.entity';
import { CompanyModule } from './modules/company/company.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [Customer, Order, Invoice, InvoiceItem, CompanyProfile],
      synchronize: true, 
    }),

    CustomersModule,
    OrdersModule,
    InvoicesModule,
    CompanyModule,
  ],
})
export class AppModule {}