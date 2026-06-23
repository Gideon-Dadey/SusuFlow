import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
} from "@nestjs/swagger";
import { CustomerService } from "./customer.service";
import { CreateCustomerDto } from "./dto/customer.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, CurrentUser, Tenant } from "../../common/decorators";
import { ROLES, TenantContext, AuthenticatedUser } from "@susuflow/shared";

@ApiTags("customers")
@ApiBearerAuth()
@ApiHeader({ name: "x-tenant-slug", required: true })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("customers")
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER, ROLES.COLLECTOR)
  @Post()
  @ApiOperation({ summary: "Onboard a new customer" })
  create(
    @Tenant() tenant: TenantContext,
    @Body() dto: CreateCustomerDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.customerService.create(tenant.id, dto, user);
  }

  @Roles(
    ROLES.COMPANY_ADMIN,
    ROLES.ACCOUNT_OFFICER,
    ROLES.COLLECTOR,
    ROLES.AUDITOR,
  )
  @Get()
  @ApiOperation({ summary: "List customers" })
  findAll(
    @Tenant() tenant: TenantContext,
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("collector_id") collectorId?: string,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const effectiveCollectorId = user?.roles.includes(ROLES.COLLECTOR)
      ? user.id
      : collectorId;
    return this.customerService.findAll(tenant.id, {
      search,
      status,
      collectorId: effectiveCollectorId,
      cursor,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get customer by ID" })
  findOne(
    @Tenant() tenant: TenantContext,
    @Param("id") id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.customerService.findOne(tenant.id, id, user);
  }

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER)
  @Post(":id/activate")
  @ApiOperation({ summary: "Activate a customer account" })
  activate(@Tenant() tenant: TenantContext, @Param("id") id: string) {
    return this.customerService.activate(tenant.id, id);
  }
}
