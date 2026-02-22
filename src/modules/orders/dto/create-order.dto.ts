import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import type { OrderStatus, PaymentStatus, VehicleType } from '../order.entity';

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
  @IsIn(['sedan', 'minivan', 'suv'] satisfies VehicleType[])
  vehicleType?: VehicleType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  carsCount?: number;

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
  @IsIn(['unpaid', 'paid'] satisfies PaymentStatus[])
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  paymentDueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
