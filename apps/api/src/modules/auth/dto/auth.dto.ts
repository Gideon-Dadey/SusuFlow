import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
  IsUUID,
  Length,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "Kwame" })
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: "Mensah" })
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: "kwame@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "+233241234567" })
  @IsString()
  phone!: string;

  @ApiProperty({ example: "12345678" })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collectorCode?: string;
}

export class LoginDto {
  @ApiProperty({ example: "kwame@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}

export class SendOtpDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: ["email", "phone"] })
  @IsIn(["email", "phone"])
  channel!: "email" | "phone";
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: ["email", "phone"] })
  @IsIn(["email", "phone"])
  channel!: "email" | "phone";

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(4, 8)
  code!: string;
}
