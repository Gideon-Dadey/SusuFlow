import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export const KYC_DOCUMENT_TYPES = [
  "ghana_card",
  "passport",
  "voter_id",
  "nhis",
  "utility_bill",
  "selfie",
] as const;

export type KycDocumentType = (typeof KYC_DOCUMENT_TYPES)[number];

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

export class ReviewKycBundleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId!: string;

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
  @ApiProperty({ enum: KYC_DOCUMENT_TYPES })
  @IsEnum(KYC_DOCUMENT_TYPES)
  documentType!: KycDocumentType;

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

export class SubmitKycDocumentItemDto {
  @ApiProperty({ enum: KYC_DOCUMENT_TYPES })
  @IsEnum(KYC_DOCUMENT_TYPES)
  documentType!: KycDocumentType;

  @ApiProperty({ example: "data:image/jpeg;base64,..." })
  @IsString()
  @IsNotEmpty()
  fileUrl!: string;
}

export class SubmitKycBatchDto {
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

  @ApiProperty({ type: [SubmitKycDocumentItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitKycDocumentItemDto)
  documents!: SubmitKycDocumentItemDto[];
}
