import { Module } from "@nestjs/common";
import { OperationsService } from "./operations.service";
import { OperationsController } from "./operations.controller";
import { TeamService } from "./team.service";
import { TeamController } from "./team.controller";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule],
  controllers: [OperationsController, TeamController],
  providers: [OperationsService, TeamService],
  exports: [OperationsService, TeamService],
})
export class OperationsModule {}
