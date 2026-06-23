import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { FraudService } from './fraud.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser, Tenant } from '../../common/decorators';
import { ROLES, TenantContext, AuthenticatedUser } from '@susuflow/shared';
import { AlertStatus } from '@susuflow/database';
import { ResolveAlertDto } from './dto/fraud.dto';

@ApiTags('fraud')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-slug', required: true })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('fraud')
export class FraudController {
  constructor(private readonly fraudService: FraudService) {}

  @Roles(ROLES.COMPANY_ADMIN, ROLES.AUDITOR)
  @Get()
  @ApiOperation({ summary: 'List fraud alerts' })
  findAll(
    @Tenant() tenant: TenantContext,
    @Query('status') status?: AlertStatus,
  ) {
    return this.fraudService.findAll(tenant.id, status);
  }

  @Roles(ROLES.COMPANY_ADMIN)
  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve a fraud alert' })
  resolve(
    @Tenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: ResolveAlertDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.fraudService.resolve(tenant.id, id, dto.status as AlertStatus, user.id, dto.resolutionNotes);
  }
}
