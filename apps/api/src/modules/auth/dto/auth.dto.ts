import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
  IsUUID,
  Length,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MIN_PASSWORD_LENGTH } from "@susuflow/shared";

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
  @MinLength(MIN_PASSWORD_LENGTH)
  password!: string;

  @ApiPropertyOptional({ example: "1998-04-12" })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    enum: ["female", "male", "other", "prefer_not_to_say"],
  })
  @IsOptional()
  @IsIn(["female", "male", "other", "prefer_not_to_say"])
  gender?: "female" | "male" | "other" | "prefer_not_to_say";

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

  @ApiPropertyOptional({ example: "iPhone 15 Pro iOS" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  deviceName?: string;
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

export class ForgotPasswordDto {
  @ApiProperty({ example: "kwame@example.com" })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: "kwame@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(4, 8)
  code!: string;

  @ApiProperty({ example: "NewPassword123!" })
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  newPassword!: string;
}

export class MfaEnableDto {
  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(4, 8)
  code!: string;
}

export class MfaDisableDto {
  @ApiProperty()
  @IsString()
  password!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(4, 8)
  code!: string;
}

export class MfaVerifyLoginDto {
  @ApiProperty()
  @IsString()
  mfaToken!: string;

  @ApiProperty()
  @IsUUID()
  userId!: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(4, 8)
  code!: string;
}
