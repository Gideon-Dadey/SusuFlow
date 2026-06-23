import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { WithdrawalService } from './withdrawal.service';
import { CreateWithdrawalDto, CreateWithdrawalRequestDto, RejectWithdrawalDto } from './dto/withdrawal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser, Tenant } from '../../common/decorators';
import { ROLES, TenantContext, AuthenticatedUser } from '@susuflow/shared';

@ApiTags('withdrawals')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-slug', required: true })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('withdrawals')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER)
  @Post()
  @ApiOperation({ summary: 'Record a customer withdrawal' })
  create(
    @Tenant() tenant: TenantContext,
    @Body() dto: CreateWithdrawalDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.withdrawalService.create(tenant.id, dto, user);
  }

  @Roles(ROLES.CUSTOMER)
  @Post('request')
  @ApiOperation({ summary: 'Request a withdrawal (saver self-serve)' })
  request(
    @Tenant() tenant: TenantContext,
    @Body() dto: CreateWithdrawalRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.withdrawalService.request(tenant.id, dto, user);
  }

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER, ROLES.CUSTOMER, ROLES.AUDITOR)
  @Get()
  @ApiOperation({ summary: 'List withdrawals' })
  findAll(
    @Tenant() tenant: TenantContext,
    @Query('customer_id') customerId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.withdrawalService.findAll(tenant.id, {
      customerId,
      cursor,
      limit: limit ? Number(limit) : 20,
    }, user);
  }

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER)
  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a pending withdrawal request' })
  approve(
    @Tenant() tenant: TenantContext,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.withdrawalService.approve(tenant.id, id, user);
  }

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER)
  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a pending withdrawal request' })
  reject(
    @Tenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: RejectWithdrawalDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.withdrawalService.reject(tenant.id, id, dto.rejectionReason, user);
  }
}
