import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
  IsOptional,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateWithdrawalDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  disbursementMethod!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  disbursementPhone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  idempotencyKey?: string;
}

export class CreateWithdrawalRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  disbursementMethod!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  disbursementPhone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  idempotencyKey?: string;
}

export class RejectWithdrawalDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rejectionReason!: string;
}
