import { IsUUID, IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollPlanDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  planId!: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  targetAmount?: number;
}
