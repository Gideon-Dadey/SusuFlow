import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateSupportTicketDto {
  @ApiProperty({ example: "withdrawals" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  topic!: string;

  @ApiProperty({ example: "Withdrawal still pending" })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(200)
  subject!: string;

  @ApiProperty({
    example: "I requested a withdrawal yesterday and it is still pending.",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(4000)
  body!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  lastChatQuestion?: string;
}
