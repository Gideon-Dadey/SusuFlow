import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { AuthService } from "./auth.service";
import { OtpService } from "./otp.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { TenantModule } from "../tenant/tenant.module";
import { CacheModule } from "../../cache/cache.module";

@Module({
  imports: [
    TenantModule,
    CacheModule,
    BullModule.registerQueue({ name: "notifications" }),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET", "dev-secret"),
        signOptions: { expiresIn: config.get("JWT_ACCESS_EXPIRY", "15m") },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, JwtStrategy],
  exports: [AuthService, OtpService, JwtModule],
})
export class AuthModule {}
