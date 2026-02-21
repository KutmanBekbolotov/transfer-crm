import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyProfile } from './company-profile.entity';
import { UpsertCompanyProfileDto } from './dto/upsert-company-profile.dto';

@Injectable()
export class CompanyProfileService {
  constructor(
    @InjectRepository(CompanyProfile)
    private readonly repo: Repository<CompanyProfile>,
  ) {}

  async getOne(): Promise<CompanyProfile | null> {
    // предполагаем 1 запись
    return this.repo.findOne({ where: {}, order: { companyName: 'ASC' } as any });
  }

  async upsert(dto: UpsertCompanyProfileDto): Promise<CompanyProfile> {
    const existing = await this.getOne();

    if (!existing) {
      const created = this.repo.create({
        companyName: dto.companyName,
        address: dto.address ?? null,
        taxId: dto.taxId ?? null,
        website: dto.website ?? null,
        bankName: dto.bankName ?? null,
        iban: dto.iban ?? null,
        swift: dto.swift ?? null,
        notes: dto.notes ?? null,
      });
      return this.repo.save(created);
    }

    existing.companyName = dto.companyName;
    existing.address = dto.address ?? null;
    existing.taxId = dto.taxId ?? null;
    existing.website = dto.website ?? null;
    existing.bankName = dto.bankName ?? null;
    existing.iban = dto.iban ?? null;
    existing.swift = dto.swift ?? null;
    existing.notes = dto.notes ?? null;

    return this.repo.save(existing);
  }
}