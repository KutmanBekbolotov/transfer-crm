import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertCompanyProfileDto {
  @IsString()
  @MaxLength(255)
  companyName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bankName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  iban?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  swift?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}