import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MaxLength, MinLength, IsNotEmpty } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: '+233201234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'john.doe@susuflow.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateUserPasswordDto {
  @ApiProperty({ example: 'OldPassword123!' })
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  newPassword!: string;
}
