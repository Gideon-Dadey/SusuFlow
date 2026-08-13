import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CurrentUser, Roles, Tenant } from "../../common/decorators";
import { AuthenticatedUser, ROLES, TenantContext } from "@susuflow/shared";
import { SupportService } from "./support.service";
import { CreateSupportTicketDto } from "./dto/support.dto";

@ApiTags("support")
@ApiBearerAuth()
@ApiHeader({ name: "x-tenant-slug", required: true })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("support")
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post("tickets")
  @Roles(ROLES.CUSTOMER, ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER)
  @ApiOperation({ summary: "Create an in-app support ticket" })
  create(
    @Tenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSupportTicketDto,
  ) {
    return this.supportService.create(tenant.id, user, dto);
  }

  @Get("tickets")
  @Roles(ROLES.CUSTOMER, ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER)
  @ApiOperation({ summary: "List my support tickets" })
  listMine(
    @Tenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.supportService.listMine(tenant.id, user.id);
  }

  @Get("tickets/:id")
  @Roles(ROLES.CUSTOMER, ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER)
  @ApiOperation({ summary: "Get one of my support tickets" })
  getMine(
    @Tenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.supportService.getMine(tenant.id, user.id, id);
  }
}
