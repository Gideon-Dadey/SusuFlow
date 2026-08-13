import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { SupportController } from "./support.controller";
import { SupportService } from "./support.service";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [BullModule.registerQueue({ name: "notifications" }), AuditModule],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
