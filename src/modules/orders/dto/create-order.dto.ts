import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import type { OrderStatus } from '../order.entity';

export class CreateOrderDto {
  @IsUUID()
  customerId!: string;

  @IsDateString()
  pickupAt!: string; 
  @IsString()
  @MaxLength(255)
  fromLocation!: string;

  @IsString()
  @MaxLength(255)
  toLocation!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  vehicleType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  driverName?: string;

  @IsString()
  price!: string; 

  @IsOptional()
  @IsIn(['draft', 'confirmed', 'done', 'canceled'] satisfies OrderStatus[])
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}