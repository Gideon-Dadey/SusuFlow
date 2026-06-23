import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
} from "@nestjs/swagger";
import { OperationsService } from "./operations.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Tenant, CurrentUser } from "../../common/decorators";
import { ROLES, TenantContext, AuthenticatedUser } from "@susuflow/shared";

@ApiTags("operations")
@ApiBearerAuth()
@ApiHeader({ name: "x-tenant-slug", required: true })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("operations")
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER, ROLES.AUDITOR)
  @Get("queue")
  @ApiOperation({ summary: "Unified action queue for pending operations" })
  getQueue(@Tenant() tenant: TenantContext) {
    return this.operationsService.getActionQueue(tenant.id);
  }

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER, ROLES.AUDITOR)
  @Get("collectors")
  @ApiOperation({ summary: "Collector performance metrics" })
  getCollectors(@Tenant() tenant: TenantContext) {
    return this.operationsService.getCollectorPerformance(tenant.id);
  }

  @Roles(ROLES.COLLECTOR)
  @Get("me/summary")
  @ApiOperation({ summary: "Collector own performance summary" })
  getMySummary(
    @Tenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.operationsService.getMyCollectorSummary(tenant.id, user.id);
  }

  @Roles(ROLES.COLLECTOR)
  @Get("me/activity")
  @ApiOperation({ summary: "Collector own audit activity log" })
  getMyActivity(
    @Tenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.operationsService.getMyActivity(tenant.id, user.id);
  }
}
