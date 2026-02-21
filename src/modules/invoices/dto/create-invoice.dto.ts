import { IsArray, IsOptional, IsString, IsUUID, ArrayMinSize } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  customerId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  orderIds!: string[];

  @IsString()
  issueDate!: string; 

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}