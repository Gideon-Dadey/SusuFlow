import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [BullModule.registerQueue({ name: "notifications" })],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
