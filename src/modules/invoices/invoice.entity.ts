import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { InvoiceItem } from './invoice-item.entity';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'canceled';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  invoiceNo!: string; 

  @ManyToOne(() => Customer, (c) => c.invoices, { onDelete: 'RESTRICT' })
  customer!: Customer;

  @Column({ type: 'date' })
  issueDate!: string; 

  @Column({ type: 'date', nullable: true })
  dueDate?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod?: string | null;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: InvoiceStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pdfPath?: string | null;

  @OneToMany(() => InvoiceItem, (it) => it.invoice, { cascade: true })
  items!: InvoiceItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}