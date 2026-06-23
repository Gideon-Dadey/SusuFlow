import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { FraudService } from './fraud.service';
import { FraudController } from './fraud.controller';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';

@Module({
  controllers: [AuditController, FraudController, ReportController],
  providers: [AuditService, FraudService, ReportService],
  exports: [AuditService, FraudService, ReportService],
})
export class AuditModule {}

