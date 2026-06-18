import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Kwame' })
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Mensah' })
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: 'kwame@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+233241234567' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'SecureP@ss123!' })
  @IsString()
  @MinLength(12)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collectorCode?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'kwame@example.com' })
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
