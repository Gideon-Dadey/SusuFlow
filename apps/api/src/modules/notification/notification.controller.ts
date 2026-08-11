import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthenticatedUser } from "@susuflow/shared";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators";
import { NotificationService } from "./notification.service";
import { UpdateNotificationPreferencesDto } from "./dto/notification.dto";

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notifications: NotificationService) {}

  @Get()
  @ApiOperation({ summary: "List the signed-in customer's push inbox" })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    return this.notifications.listInbox(
      user.id,
      cursor,
      limit ? Number(limit) : undefined,
    );
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Unread push inbox count" })
  unreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notifications.unreadCount(user.id).then((unreadCount) => ({
      unreadCount,
    }));
  }

  @Get("preferences")
  @ApiOperation({ summary: "Get push notification preferences" })
  getPreferences(@CurrentUser() user: AuthenticatedUser) {
    return this.notifications.getPreferences(user.id);
  }

  @Put("preferences")
  @ApiOperation({ summary: "Update push notification preferences" })
  updatePreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.notifications.updatePreferences(user.id, dto);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark one inbox notification as read" })
  markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.notifications.markRead(user.id, id);
  }

  @Post("read-all")
  @ApiOperation({ summary: "Mark the entire push inbox as read" })
  markAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notifications.markAllRead(user.id);
  }

  @Post("test")
  @ApiOperation({
    summary: "Queue a test push to this device (works while the app is closed)",
  })
  sendTest(@CurrentUser() user: AuthenticatedUser) {
    return this.notifications.enqueueTest(user.id, user.tenantId);
  }
}
