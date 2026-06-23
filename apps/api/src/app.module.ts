import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { join } from "path";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { BullModule } from "@nestjs/bullmq";
import { LoggerModule } from "nestjs-pino";
import { PrismaModule } from "./prisma/prisma.module";
import { CacheModule } from "./cache/cache.module";
import { AuthModule } from "./modules/auth/auth.module";
import { TenantModule } from "./modules/tenant/tenant.module";
import { UserModule } from "./modules/user/user.module";
import { CustomerModule } from "./modules/customer/customer.module";
import { WalletModule } from "./modules/wallet/wallet.module";
import { LedgerModule } from "./modules/ledger/ledger.module";
import { DepositModule } from "./modules/deposit/deposit.module";
import { WithdrawalModule } from "./modules/withdrawal/withdrawal.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { AuditModule } from "./modules/audit/audit.module";
import { HealthModule } from "./modules/health/health.module";
import { BillingModule } from "./modules/billing/billing.module";
import { PlanModule } from "./modules/plan/plan.module";
import { OperationsModule } from "./modules/operations/operations.module";
import { CommonModule } from "./common/common.module";
import { TenantMiddleware } from "./common/middleware/tenant.middleware";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";
import { getRedisConnectionOptions } from "@susuflow/shared";
import { loggerConfig } from "./config/logger.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, "../../../.env"),
    }),
    LoggerModule.forRoot(loggerConfig),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL_MS || "60000", 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || "100", 10),
      },
    ]),
    BullModule.forRoot({
      connection: getRedisConnectionOptions(),
    }),
    CacheModule,
    PrismaModule,
    CommonModule,
    AuthModule,
    TenantModule,
    UserModule,
    CustomerModule,
    WalletModule,
    LedgerModule,
    DepositModule,
    WithdrawalModule,
    PaymentModule,
    AuditModule,
    HealthModule,
    BillingModule,
    PlanModule,
    OperationsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, TenantMiddleware).forRoutes("*");
  }
}
