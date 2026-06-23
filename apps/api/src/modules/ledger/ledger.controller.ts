import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { LedgerService } from './ledger.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Tenant, CurrentUser } from '../../common/decorators';
import { ROLES, TenantContext, AuthenticatedUser } from '@susuflow/shared';
import { CommissionPayoutDto } from './dto/ledger.dto';

@ApiTags('ledger')
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-slug', required: true })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Roles(ROLES.COMPANY_ADMIN, ROLES.AUDITOR)
  @Get('accounts')
  @ApiOperation({ summary: 'Get chart of accounts with computed balances' })
  getAccounts(@Tenant() tenant: TenantContext) {
    return this.ledgerService.getAccountsWithBalances(tenant.id);
  }

  @Roles(ROLES.COMPANY_ADMIN, ROLES.AUDITOR)
  @Get('commissions')
  @ApiOperation({ summary: 'Get collector commissions log' })
  getCommissions(@Tenant() tenant: TenantContext) {
    return this.ledgerService.getCommissions(tenant.id);
  }

  @Roles(ROLES.COMPANY_ADMIN)
  @Post('commissions/payout')
  @ApiOperation({ summary: 'Payout collector commissions' })
  payoutCommission(
    @Tenant() tenant: TenantContext,
    @Body() dto: CommissionPayoutDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ledgerService.payoutCommission(
      tenant.id,
      dto.collectorId,
      dto.amount,
      user.id,
      dto.description,
    );
  }
}
