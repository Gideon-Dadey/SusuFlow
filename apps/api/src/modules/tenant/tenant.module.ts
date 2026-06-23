import { Module } from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { TenantController } from "./tenant.controller";
import { CacheModule } from "../../cache/cache.module";
import { DemoSeederService } from "./demo-seeder.service";
import { PlanModule } from "../plan/plan.module";

@Module({
  imports: [CacheModule, PlanModule],
  controllers: [TenantController],
  providers: [TenantService, DemoSeederService],
  exports: [TenantService, DemoSeederService],
})
export class TenantModule {}
