import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { enqueueNotification } from "../../common/notifications/enqueue";
import { AuthenticatedUser } from "@susuflow/shared";
import { CreateSupportTicketDto } from "./dto/support.dto";

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @InjectQueue("notifications") private readonly notificationQueue: Queue,
  ) {}

  async create(
    tenantId: string,
    user: AuthenticatedUser,
    dto: CreateSupportTicketDto,
  ) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        tenantId,
        userId: user.id,
        topic: dto.topic.trim().slice(0, 50),
        subject: dto.subject.trim().slice(0, 200),
        body: dto.body.trim().slice(0, 4000),
        metadata: {
          lastChatQuestion: dto.lastChatQuestion?.trim() || null,
          email: user.email,
        },
      },
    });

    await this.audit.log({
      tenantId,
      userId: user.id,
      action: "support:ticket_create",
      resourceType: "support_ticket",
      resourceId: ticket.id,
      afterState: {
        topic: ticket.topic,
        subject: ticket.subject,
        status: ticket.status,
      },
    });

    const supportEmail =
      process.env.SUPPORT_EMAIL?.trim() ||
      process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() ||
      "support@susuflow.com";

    await enqueueNotification(
      this.notificationQueue,
      "support-ticket-created",
      {
        tenantId,
        ticketId: ticket.id,
        userId: user.id,
        email: user.email,
        supportEmail,
        topic: ticket.topic,
        subject: ticket.subject,
        body: ticket.body,
      },
      ticket.id,
    );

    return ticket;
  }

  async listMine(tenantId: string, userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async getMine(tenantId: string, userId: string, ticketId: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, tenantId, userId },
    });
    if (!ticket) throw new NotFoundException("Support ticket not found");
    return ticket;
  }
}
