import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
} from "@nestjs/swagger";
import { PlanService } from "./plan.service";
import {
  EnrollPlanDto,
  CreateSavingsPlanDto,
  UpdateSavingsPlanDto,
} from "./dto/plan.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, CurrentUser, Tenant } from "../../common/decorators";
import { ROLES, TenantContext, AuthenticatedUser } from "@susuflow/shared";

@ApiTags("plans")
@ApiBearerAuth()
@ApiHeader({ name: "x-tenant-slug", required: true })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("plans")
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  @ApiOperation({ summary: "Get savings plans for tenant" })
  findAll(
    @Tenant() tenant: TenantContext,
    @Query("all") all?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    if (all === "true") {
      const staffRoles = [
        ROLES.COMPANY_ADMIN,
        ROLES.ACCOUNT_OFFICER,
        ROLES.AUDITOR,
      ] as string[];
      if (!user?.roles.some((role) => staffRoles.includes(role))) {
        throw new ForbiddenException("Staff access required to list all plans");
      }
      return this.planService.findAll(tenant.id);
    }
    return this.planService.findAllActive(tenant.id);
  }

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER)
  @Post()
  @ApiOperation({ summary: "Create a savings plan for the tenant" })
  create(@Tenant() tenant: TenantContext, @Body() dto: CreateSavingsPlanDto) {
    return this.planService.create(tenant.id, dto);
  }

  @Roles(ROLES.CUSTOMER)
  @Post("enroll")
  @ApiOperation({ summary: "Enroll customer in a savings plan" })
  enroll(
    @Tenant() tenant: TenantContext,
    @Body() dto: EnrollPlanDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.planService.enroll(tenant.id, user.id, dto);
  }

  @Roles(ROLES.CUSTOMER)
  @Get("my-enrollments")
  @ApiOperation({ summary: "Get current customer active plan enrollments" })
  myEnrollments(
    @Tenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.planService.myEnrollments(tenant.id, user.id);
  }

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER, ROLES.AUDITOR)
  @Get("enrollments")
  @ApiOperation({ summary: "Get all customer plan enrollments" })
  allEnrollments(@Tenant() tenant: TenantContext) {
    return this.planService.allEnrollments(tenant.id);
  }

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER)
  @Patch(":id")
  @ApiOperation({ summary: "Update a savings plan" })
  update(
    @Tenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body() dto: UpdateSavingsPlanDto,
  ) {
    return this.planService.update(tenant.id, id, dto);
  }
}
