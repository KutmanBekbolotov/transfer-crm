import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Order } from '../orders/order.entity';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Invoice, (i) => i.items, { onDelete: 'CASCADE' })
  invoice!: Invoice;

  @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
  order?: Order | null;

  @Column({ type: 'int', default: 1 })
  qty!: number;

  @Column({ type: 'varchar', length: 500 })
  description!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  unitPrice!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount!: string;
}