import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  IsIn,
  IsInt,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

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

export class CreateSavingsPlanDto {
  @ApiProperty({ example: "Weekly Susu" })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: ["daily", "weekly", "biweekly", "monthly"] })
  @IsIn(["daily", "weekly", "biweekly", "monthly"])
  frequency!: "daily" | "weekly" | "biweekly" | "monthly";

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsPositive()
  minAmount!: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxAmount?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMonths?: number;
}

export class UpdateSavingsPlanDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: ["daily", "weekly", "biweekly", "monthly"] })
  @IsOptional()
  @IsIn(["daily", "weekly", "biweekly", "monthly"])
  frequency?: "daily" | "weekly" | "biweekly" | "monthly";

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  minAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMonths?: number;

  @ApiPropertyOptional({ enum: ["active", "inactive"] })
  @IsOptional()
  @IsIn(["active", "inactive"])
  status?: "active" | "inactive";
}
