import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';

export type OrderStatus = 'draft' | 'confirmed' | 'done' | 'canceled';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Customer, (c) => c.orders, { onDelete: 'RESTRICT' })
  customer!: Customer;

  @Index()
  @Column({ type: 'timestamptz' })
  pickupAt!: Date;

  @Column({ type: 'varchar', length: 255 })
  fromLocation!: string;

  @Column({ type: 'varchar', length: 255 })
  toLocation!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vehicleType?: string | null; // sedan, minivan...

  @Column({ type: 'varchar', length: 255, nullable: true })
  driverName?: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price!: string; // TypeORM numeric -> string

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: OrderStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}