import { Module, Global } from "@nestjs/common";
import { FinancialEventService } from "./services/financial-event.service";

@Global()
@Module({
  providers: [FinancialEventService],
  exports: [FinancialEventService],
})
export class CommonModule {}
