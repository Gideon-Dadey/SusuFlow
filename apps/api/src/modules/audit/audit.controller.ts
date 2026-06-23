import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Tenant } from '../../common/decorators';
import { ROLES, TenantContext } from '@susuflow/shared';

@ApiTags('audit')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-slug', required: true })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Roles(ROLES.COMPANY_ADMIN, ROLES.AUDITOR)
  @Get()
  @ApiOperation({ summary: 'List security audit logs' })
  findAll(
    @Tenant() tenant: TenantContext,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.findAll(tenant.id, {
      userId,
      action,
      resourceType,
      cursor,
      limit: limit ? Number(limit) : 50,
    });
  }
}
