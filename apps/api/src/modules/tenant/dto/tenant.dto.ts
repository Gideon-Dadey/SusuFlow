import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'xyz-susu' })
  @IsString()
  @MaxLength(30)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase letters, numbers, and hyphens only',
  })
  slug!: string;

  @ApiProperty({ example: 'XYZ Susu Company' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'admin@xyzsusu.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+233201234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ['starter', 'growth', 'enterprise'] })
  @IsOptional()
  @IsEnum(['starter', 'growth', 'enterprise'])
  plan?: 'starter' | 'growth' | 'enterprise';

  @ApiProperty({ example: 'Ama' })
  @IsString()
  @MaxLength(100)
  adminFirstName!: string;

  @ApiProperty({ example: 'Asante' })
  @IsString()
  @MaxLength(100)
  adminLastName!: string;

  @ApiProperty({ example: 'admin@xyzsusu.com' })
  @IsEmail()
  adminEmail!: string;

  @ApiPropertyOptional({ example: '+233201234567' })
  @IsOptional()
  @IsString()
  adminPhone?: string;

  @ApiPropertyOptional({
    description: 'Leave blank to auto-generate a secure temporary password',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  adminPassword?: string;
}

export class SuspendTenantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
