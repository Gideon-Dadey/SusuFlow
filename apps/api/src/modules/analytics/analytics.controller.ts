import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { IsObject, IsOptional, IsString, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PinoLogger } from "nestjs-pino";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser, Tenant } from "../../common/decorators";
import { AuthenticatedUser, TenantContext } from "@susuflow/shared";

export class TrackAnalyticsDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  event!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;
}

@ApiTags("analytics")
@ApiBearerAuth()
@ApiHeader({ name: "x-tenant-slug", required: false })
@UseGuards(JwtAuthGuard)
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AnalyticsController.name);
  }

  @Post("events")
  @ApiOperation({ summary: "Ingest a product analytics event from mobile/web" })
  track(
    @Body() dto: TrackAnalyticsDto,
    @CurrentUser() user: AuthenticatedUser,
    @Tenant() tenant?: TenantContext,
  ) {
    this.logger.info(
      {
        analyticsEvent: dto.event,
        properties: dto.properties ?? {},
        userId: user.id,
        tenantId: tenant?.id,
      },
      "analytics.event",
    );
    return { ok: true };
  }
}
