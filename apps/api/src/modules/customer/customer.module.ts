import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { CustomerService } from "./customer.service";
import { CustomerController } from "./customer.controller";
import { KycService } from "./kyc.service";
import { KycController } from "./kyc.controller";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule, BullModule.registerQueue({ name: "notifications" })],
  controllers: [CustomerController, KycController],
  providers: [CustomerService, KycService],
  exports: [CustomerService, KycService],
})
export class CustomerModule {}
