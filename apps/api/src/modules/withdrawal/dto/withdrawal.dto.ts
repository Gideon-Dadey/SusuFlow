import { IsString, IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}

export class RejectWithdrawalDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rejectionReason!: string;
}

