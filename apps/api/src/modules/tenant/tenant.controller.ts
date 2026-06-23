import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public, Tenant } from '../../common/decorators';
import { ROLES, TenantContext } from '@susuflow/shared';
import { CreateTenantDto, SuspendTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { DemoSeederService } from './demo-seeder.service';

@ApiTags('tenants')
@Controller()
export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly demoSeeder: DemoSeederService,
  ) {}

  @Public()
  @Get('tenants/:slug')
  @ApiOperation({ summary: 'Get tenant by slug (public branding info)' })
  getBySlug(@Param('slug') slug: string) {
    return this.tenantService.findBySlug(slug);
  }

  @Public()
  @Post('tenants/:slug/seed-demo')
  @ApiOperation({ summary: 'Seed robust mock transaction and audit data for demonstration' })
  seedDemo(@Param('slug') slug: string) {
    return this.demoSeeder.seedDemoData(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER, ROLES.COLLECTOR, ROLES.AUDITOR)
  @ApiBearerAuth()
  @Get('tenants/me')
  @ApiOperation({ summary: 'Get current tenant details' })
  getMe(@Tenant() tenant: TenantContext) {
    return this.tenantService.findById(tenant.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.COMPANY_ADMIN)
  @ApiBearerAuth()
  @Put('tenants/me')
  @ApiOperation({ summary: 'Update current tenant settings' })
  updateMe(
    @Tenant() tenant: TenantContext,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantService.update(tenant.id, dto);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/tenants')
  @ApiOperation({ summary: 'List all tenants (super admin)' })
  list(@Query('cursor') cursor?: string, @Query('limit') limit?: number) {
    return this.tenantService.findAll(cursor, limit ? Number(limit) : 20);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/tenants/:id')
  @ApiOperation({ summary: 'Get tenant by ID (super admin)' })
  getById(@Param('id') id: string) {
    return this.tenantService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Post('admin/tenants')
  @ApiOperation({ summary: 'Provision organization + company admin (super admin)' })
  create(@Body() dto: CreateTenantDto) {
    return this.tenantService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Post('admin/tenants/:id/activate')
  @ApiOperation({ summary: 'Activate tenant after payment or manual approval' })
  activate(@Param('id') id: string) {
    return this.tenantService.activate(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Post('admin/tenants/:id/suspend')
  @ApiOperation({ summary: 'Suspend tenant (blocks all users)' })
  suspend(@Param('id') id: string, @Body() dto: SuspendTenantDto) {
    return this.tenantService.suspend(id, dto.reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/dashboard/summary')
  @ApiOperation({ summary: 'Get global dashboard overview stats (super admin)' })
  getGlobalSummary() {
    return this.tenantService.getGlobalSummary();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/deposits')
  @ApiOperation({ summary: 'List deposits globally (super admin)' })
  getGlobalDeposits(
    @Query('status') status?: string,
    @Query('tenant_id') tenantId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.tenantService.getGlobalDeposits({ status, tenantId, cursor, limit });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/withdrawals')
  @ApiOperation({ summary: 'List withdrawals globally (super admin)' })
  getGlobalWithdrawals(
    @Query('status') status?: string,
    @Query('tenant_id') tenantId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.tenantService.getGlobalWithdrawals({ status, tenantId, cursor, limit });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/fraud')
  @ApiOperation({ summary: 'List fraud alerts globally (super admin)' })
  getGlobalFraud(
    @Query('status') status?: string,
    @Query('tenant_id') tenantId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.tenantService.getGlobalFraud({ status, tenantId, cursor, limit });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/audit')
  @ApiOperation({ summary: 'List audit logs globally (super admin)' })
  getGlobalAuditLogs(
    @Query('tenant_id') tenantId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.tenantService.getGlobalAuditLogs({ tenantId, cursor, limit });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/health')
  @ApiOperation({ summary: 'Get global system health and latency logs (super admin)' })
  getGlobalHealth() {
    return this.tenantService.getGlobalHealth();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/billing')
  @ApiOperation({ summary: 'Get platform revenue & billing subscription reports (super admin)' })
  getGlobalBilling() {
    return this.tenantService.getGlobalBilling();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/ledger')
  @ApiOperation({ summary: 'Get system consolidated trial balance ledger (super admin)' })
  getGlobalLedger() {
    return this.tenantService.getGlobalLedger();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/commissions')
  @ApiOperation({ summary: 'Get consolidated collector commission balances (super admin)' })
  getGlobalCommissions() {
    return this.tenantService.getGlobalCommissions();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/plans')
  @ApiOperation({ summary: 'Get platform savings plans config and enrollments (super admin)' })
  getGlobalPlans() {
    return this.tenantService.getGlobalPlans();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/customers')
  @ApiOperation({ summary: 'Get platform-wide customers directory (super admin)' })
  getGlobalCustomers(@Query('search') search?: string) {
    return this.tenantService.getGlobalCustomers({ search });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/users')
  @ApiOperation({ summary: 'Get platform-wide users directory (super admin)' })
  getGlobalUsers() {
    return this.tenantService.getGlobalUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/kyc')
  @ApiOperation({ summary: 'Get global KYC document review queue (super admin)' })
  getGlobalKycQueue() {
    return this.tenantService.getGlobalKycQueue();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get('admin/settings')
  @ApiOperation({ summary: 'Get platform global configurations (super admin)' })
  getGlobalSettings() {
    return this.tenantService.getGlobalSettings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Put('admin/settings')
  @ApiOperation({ summary: 'Update platform global configurations (super admin)' })
  updateGlobalSettings(@Body() dto: any) {
    return this.tenantService.updateGlobalSettings(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Post('admin/dev-ops/clear-cache')
  @ApiOperation({ summary: 'Clear platform redis cache keys (super admin)' })
  clearPlatformCache() {
    return this.tenantService.clearPlatformCache();
  }
}
