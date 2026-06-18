import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { DepositService } from './deposit.service';
import { CreateDepositDto } from './dto/deposit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser, Tenant } from '../../common/decorators';
import { ROLES, TenantContext, AuthenticatedUser } from '@susuflow/shared';

@ApiTags('deposits')
@Controller()
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.CUSTOMER, ROLES.COLLECTOR, ROLES.ACCOUNT_OFFICER, ROLES.COMPANY_ADMIN)
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', required: true })
  @Post('deposits')
  @ApiOperation({ summary: 'Initiate a deposit' })
  initiate(
    @Tenant() tenant: TenantContext,
    @Body() dto: CreateDepositDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.depositService.initiate(tenant.id, dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', required: true })
  @Get('deposits')
  @ApiOperation({ summary: 'List deposits' })
  findAll(
    @Tenant() tenant: TenantContext,
    @Query('status') status?: string,
    @Query('customer_id') customerId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.depositService.findAll(tenant.id, { status, customerId, cursor, limit: limit ? Number(limit) : 20 });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-tenant-slug', required: true })
  @Get('deposits/:id')
  @ApiOperation({ summary: 'Get deposit by ID' })
  findOne(@Tenant() tenant: TenantContext, @Param('id') id: string) {
    return this.depositService.findOne(tenant.id, id);
  }

}
