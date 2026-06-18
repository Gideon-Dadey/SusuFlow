import { IsNumber, IsString, IsUUID, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@susuflow/database';

export class CreateDepositDto {
  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty()
  @IsUUID()
  customerId!: string;

  @ApiProperty({ example: '+233241234567' })
  @IsString()
  payerPhone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  collectorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
