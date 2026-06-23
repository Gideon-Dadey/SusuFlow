import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
import { ROLES } from '@susuflow/shared';
import { CreateTenantDto, SuspendTenantDto } from './dto/tenant.dto';
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
}
