import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ROLES } from "@susuflow/shared";

const TEAM_ROLES = [
  ROLES.ACCOUNT_OFFICER,
  ROLES.COLLECTOR,
  ROLES.AUDITOR,
] as const;

export class CreateTeamMemberDto {
  @ApiProperty({ example: "Ama" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: "Owusu" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: "ama.owusu@abcsusu.com" })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: "+233201234567" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ enum: TEAM_ROLES, example: ROLES.COLLECTOR })
  @IsIn(TEAM_ROLES)
  role!: (typeof TEAM_ROLES)[number];

  @ApiPropertyOptional({
    description: "Leave blank to auto-generate a temporary password",
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  password?: string;
}

export class UpdateTeamMemberDto {
  @ApiPropertyOptional({ enum: ["active", "suspended", "pending"] })
  @IsOptional()
  @IsIn(["active", "suspended", "pending"])
  status?: "active" | "suspended" | "pending";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
