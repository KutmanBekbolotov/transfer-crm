import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from './order.entity';
import { Customer } from '../customers/customer.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(Customer) private readonly customersRepo: Repository<Customer>,
  ) {}

  async create(dto: CreateOrderDto) {
    const customer = await this.customersRepo.findOne({ where: { id: dto.customerId } });
    if (!customer) throw new BadRequestException('Invalid customerId');

    const order = this.ordersRepo.create({
      customer,
      pickupAt: new Date(dto.pickupAt),
      fromLocation: dto.fromLocation,
      toLocation: dto.toLocation,
      vehicleType: dto.vehicleType ?? null,
      carsCount: dto.carsCount ?? 1,
      driverName: dto.driverName ?? null,
      price: dto.price,
      status: dto.status ?? 'draft',
      paymentStatus: dto.paymentStatus ?? 'unpaid',
      paymentDueDate: dto.paymentDueDate ? dto.paymentDueDate.slice(0, 10) : null,
      notes: dto.notes ?? null,
    });

    return this.ordersRepo.save(order);
  }

  async findAll(params: {
    customerId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    from?: string; // YYYY-MM-DD
    to?: string;   // YYYY-MM-DD
  }) {
    const where: any = {};

    if (params.customerId) where.customer = { id: params.customerId };
    if (params.status) where.status = params.status;
    if (params.paymentStatus) where.paymentStatus = params.paymentStatus;

    if (params.from && params.to) {
      const fromDate = new Date(params.from + 'T00:00:00.000Z');
      const toDate = new Date(params.to + 'T23:59:59.999Z');
      where.pickupAt = Between(fromDate, toDate);
    }

    return this.ordersRepo.find({
      where,
      relations: { customer: true },
      order: { pickupAt: 'DESC' },
      take: 200,
    });
  }

  async findOne(id: string) {
    const order = await this.ordersRepo.findOne({
      where: { id },
      relations: { customer: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: string, dto: UpdateOrderDto) {
    const order = await this.findOne(id);

    if (dto.customerId) {
      const customer = await this.customersRepo.findOne({ where: { id: dto.customerId } });
      if (!customer) throw new BadRequestException('Invalid customerId');
      order.customer = customer;
    }

    if (dto.pickupAt) order.pickupAt = new Date(dto.pickupAt);
    if (dto.fromLocation !== undefined) order.fromLocation = dto.fromLocation;
    if (dto.toLocation !== undefined) order.toLocation = dto.toLocation;
    if (dto.vehicleType !== undefined) order.vehicleType = dto.vehicleType ?? null;
    if (dto.carsCount !== undefined) order.carsCount = dto.carsCount;
    if (dto.driverName !== undefined) order.driverName = dto.driverName ?? null;
    if (dto.price !== undefined) order.price = dto.price;
    if (dto.status !== undefined) order.status = dto.status;
    if (dto.paymentStatus !== undefined) order.paymentStatus = dto.paymentStatus;
    if (dto.paymentDueDate !== undefined) {
      order.paymentDueDate = dto.paymentDueDate ? dto.paymentDueDate.slice(0, 10) : null;
    }
    if (dto.notes !== undefined) order.notes = dto.notes ?? null;

    return this.ordersRepo.save(order);
  }
}
