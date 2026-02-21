import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Customer } from '../customers/customer.entity';
import { Order } from '../orders/order.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { makeInvoiceNo } from './invoice-no';

function moneyAdd(a: string, b: string) {
  // numeric strings -> number (для MVP ок). Если нужно строго — подключим decimal.js
  return (Number(a) + Number(b)).toFixed(2);
}

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice) private readonly invoicesRepo: Repository<Invoice>,
    @InjectRepository(InvoiceItem) private readonly itemsRepo: Repository<InvoiceItem>,
    @InjectRepository(Customer) private readonly customersRepo: Repository<Customer>,
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
  ) {}

  async createFromOrders(dto: CreateInvoiceDto) {
    const customer = await this.customersRepo.findOne({ where: { id: dto.customerId } });
    if (!customer) throw new BadRequestException('Invalid customerId');

    const orders = await this.ordersRepo.find({
      where: { id: In(dto.orderIds) },
      relations: { customer: true },
    });

    if (orders.length !== dto.orderIds.length) {
      throw new BadRequestException('Some orders were not found');
    }

    // Проверка: все заказы должны быть этого клиента
    const wrong = orders.find((o) => o.customer.id !== dto.customerId);
    if (wrong) throw new BadRequestException('All orders must belong to the same customer');

    const invoice = this.invoicesRepo.create({
      invoiceNo: makeInvoiceNo('TY'),
      customer,
      issueDate: dto.issueDate.slice(0, 10),
      dueDate: dto.dueDate ? dto.dueDate.slice(0, 10) : null,
      paymentMethod: dto.paymentMethod ?? null,
      status: 'draft',
      total: '0.00',
    });

    // Сначала сохраняем invoice, чтобы был id
    const savedInvoice = await this.invoicesRepo.save(invoice);

    let total = '0.00';
    const items: InvoiceItem[] = [];

    for (const o of orders) {
      const description = `Transfer: ${o.fromLocation} → ${o.toLocation} (${new Date(o.pickupAt).toISOString()})`;
      const unitPrice = String(o.price);
      const amount = unitPrice; // qty=1

      total = moneyAdd(total, amount);

      items.push(
        this.itemsRepo.create({
          invoice: savedInvoice,
          order: o,
          qty: 1,
          description,
          unitPrice,
          amount,
        }),
      );
    }

    await this.itemsRepo.save(items);

    savedInvoice.total = total;
    await this.invoicesRepo.save(savedInvoice);

    return this.findOne(savedInvoice.id);
  }

  async findAll(customerId?: string) {
    const where: any = {};
    if (customerId) where.customer = { id: customerId };

    return this.invoicesRepo.find({
      where,
      relations: { customer: true },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async findOne(id: string) {
    const invoice = await this.invoicesRepo.findOne({
      where: { id },
      relations: { customer: true, items: { order: true } },
      order: { items: { id: 'ASC' } },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async setStatus(id: string, status: 'draft' | 'sent' | 'paid' | 'canceled') {
    const invoice = await this.findOne(id);
    invoice.status = status;
    return this.invoicesRepo.save(invoice);
  }
}