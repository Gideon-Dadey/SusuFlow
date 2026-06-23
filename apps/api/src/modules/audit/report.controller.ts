import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
} from "@nestjs/swagger";
import { ReportService } from "./report.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Tenant } from "../../common/decorators";
import { ROLES, TenantContext } from "@susuflow/shared";

@ApiTags("reports")
@ApiBearerAuth()
@ApiHeader({ name: "x-tenant-slug", required: true })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("reports")
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER, ROLES.AUDITOR)
  @Get("summary")
  @ApiOperation({ summary: "Get summary operations metrics" })
  getSummary(@Tenant() tenant: TenantContext) {
    return this.reportService.getSummary(tenant.id);
  }
}
