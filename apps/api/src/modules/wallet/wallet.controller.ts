import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
} from "@nestjs/swagger";
import { WalletService } from "./wallet.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Tenant } from "../../common/decorators";
import { TenantContext } from "@susuflow/shared";

@ApiTags("wallets")
@ApiBearerAuth()
@ApiHeader({ name: "x-tenant-slug", required: true })
@UseGuards(JwtAuthGuard)
@Controller("wallets")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(":id/balance")
  @ApiOperation({ summary: "Get wallet balance" })
  getBalance(@Tenant() tenant: TenantContext, @Param("id") id: string) {
    return this.walletService.getBalance(tenant.id, id);
  }
}

@ApiTags("customers")
@Controller("customers")
export class CustomerWalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({ name: "x-tenant-slug", required: true })
  @Get(":id/wallet")
  @ApiOperation({ summary: "Get customer wallet balance" })
  getCustomerWallet(
    @Tenant() tenant: TenantContext,
    @Param("id") customerId: string,
  ) {
    return this.walletService.getCustomerWallet(tenant.id, customerId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({ name: "x-tenant-slug", required: true })
  @Get(":id/passbook")
  @ApiOperation({
    summary: "Get customer digital passbook (totals + recent payments)",
  })
  getCustomerPassbook(
    @Tenant() tenant: TenantContext,
    @Param("id") customerId: string,
  ) {
    return this.walletService.getCustomerPassbook(tenant.id, customerId);
  }
}
