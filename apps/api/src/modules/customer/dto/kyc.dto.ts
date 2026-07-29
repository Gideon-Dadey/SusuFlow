import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ReviewKycDto {
  @ApiProperty({ enum: ["approved", "rejected"] })
  @IsNotEmpty()
  @IsString()
  status!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class SubmitKycDto {
  @ApiProperty({ enum: ["ghana_card", "passport", "utility_bill", "selfie"] })
  @IsEnum(["ghana_card", "passport", "utility_bill", "selfie"])
  documentType!: "ghana_card" | "passport" | "utility_bill" | "selfie";

  @ApiProperty({ example: "GHA-000000000-0" })
  @IsString()
  @IsNotEmpty()
  idNumber!: string;

  @ApiPropertyOptional({ example: "1990-01-01" })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: "123 Main St, Accra" })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: "https://..." })
  @IsString()
  @IsNotEmpty()
  fileUrl!: string;
}
