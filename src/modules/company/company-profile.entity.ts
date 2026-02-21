import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('company_profile')
export class CompanyProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  companyName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  taxId?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankName?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  iban?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  swift?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes?: string | null;
}
