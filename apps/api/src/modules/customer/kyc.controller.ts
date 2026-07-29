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
import { KycService } from "./kyc.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, CurrentUser, Tenant } from "../../common/decorators";
import { ROLES, TenantContext, AuthenticatedUser } from "@susuflow/shared";
import { DocumentStatus } from "@susuflow/database";
import { ReviewKycDto, SubmitKycDto } from "./dto/kyc.dto";

@ApiTags("kyc")
@ApiBearerAuth()
@ApiHeader({ name: "x-tenant-slug", required: true })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("kyc")
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get("my-status")
  @ApiOperation({ summary: "Get current customer KYC status & documents" })
  getMyStatus(
    @Tenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.kycService.getCustomerKycStatus(tenant.id, user.id);
  }

  @Post("submit")
  @ApiOperation({ summary: "Submit KYC document for verification" })
  submit(
    @Tenant() tenant: TenantContext,
    @Body() dto: SubmitKycDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.kycService.submitKyc(tenant.id, user.id, dto);
  }

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER, ROLES.AUDITOR)
  @Get()
  @ApiOperation({ summary: "List KYC documents" })
  findAll(
    @Tenant() tenant: TenantContext,
    @Query("status") status?: DocumentStatus,
  ) {
    return this.kycService.findAll(tenant.id, status);
  }

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER)
  @Post(":id/review")
  @ApiOperation({ summary: "Review a KYC document" })
  review(
    @Tenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body() dto: ReviewKycDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.kycService.review(
      tenant.id,
      id,
      dto.status as DocumentStatus,
      user.id,
      dto.rejectionReason,
    );
  }
}
