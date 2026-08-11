import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
  IsNotEmpty,
  ValidateIf,
} from "class-validator";
import { MIN_PASSWORD_LENGTH } from "@susuflow/shared";

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: "John" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: "Doe" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: "+233201234567" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: "john.doe@susuflow.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.avatarUrl !== null)
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;
}

export class UpdateUserPasswordDto {
  @ApiProperty({ example: "OldPassword123!" })
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;

  @ApiProperty({ example: "NewPassword123!" })
  @IsNotEmpty()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  newPassword!: string;
}

export class DeleteAccountDto {
  @ApiProperty({ example: "CurrentPassword123!" })
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;
}

export class RegisterPushTokenDto {
  @ApiProperty({ example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(512)
  token!: string;

  @ApiPropertyOptional({ example: "ios", enum: ["ios", "android"] })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  platform?: string;

  @ApiPropertyOptional({ example: "iPhone 15" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  deviceName?: string;

  @ApiPropertyOptional({ example: "1.0.0" })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  appVersion?: string;
}

export class RemovePushTokenDto {
  @ApiProperty({ example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(512)
  token!: string;
}
