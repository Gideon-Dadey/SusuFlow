import {
  IsNumber,
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  Min,
  MaxLength,
  Matches,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentMethod } from "@susuflow/database";

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

  @ApiPropertyOptional({
    example: "+233241234567",
    description:
      "Required for mobile money. Optional contact phone for bank transfer receipts.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  payerPhone?: string;

  @ApiPropertyOptional({
    example: "GCB",
    description: "Required when paymentMethod is bank_transfer.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: "bankCode must be alphanumeric",
  })
  bankCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  collectorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  idempotencyKey?: string;
}
