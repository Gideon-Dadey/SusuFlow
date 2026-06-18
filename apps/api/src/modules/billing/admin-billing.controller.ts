import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { ROLES } from '@susuflow/shared';
import { BillingService } from './billing.service';

@ApiTags('billing')
@Controller()
export class AdminBillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiBearerAuth()
  @Post('admin/tenants/:id/billing/checkout')
  @ApiOperation({ summary: 'Initialize Paystack subscription payment' })
  createCheckout(@Param('id') id: string) {
    return this.billingService.initializeSubscriptionCheckout(id);
  }
}
