import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { PrismaService } from "../../prisma/prisma.service";
import { DocumentStatus } from "@susuflow/database";
import { AuditService } from "../audit/audit.service";
import { enqueueNotification } from "../../common/notifications/enqueue";
import type { KycDocumentType } from "./dto/kyc.dto";

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @InjectQueue("notifications") private readonly notificationQueue: Queue,
  ) {}

  async getCustomerKycStatus(tenantId: string, userId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { tenantId, userId },
      include: {
        kycDocuments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) throw new NotFoundException("Customer profile not found");

    return {
      customerId: customer.id,
      kycLevel: customer.kycLevel,
      kycStatus: customer.kycStatus,
      ghanaCardNumber: customer.ghanaCardNumber,
      dateOfBirth: customer.dateOfBirth,
      address: customer.address,
      documents: customer.kycDocuments,
    };
  }

  async submitKyc(
    tenantId: string,
    userId: string,
    dto: {
      documentType: KycDocumentType;
      idNumber: string;
      dateOfBirth?: string;
      address?: string;
      fileUrl: string;
    },
  ) {
    const result = await this.submitKycBatch(tenantId, userId, {
      idNumber: dto.idNumber,
      dateOfBirth: dto.dateOfBirth,
      address: dto.address,
      documents: [{ documentType: dto.documentType, fileUrl: dto.fileUrl }],
    });
    return result.documents[0];
  }

  /** One round-trip: update profile + create all pending docs together. */
  async submitKycBatch(
    tenantId: string,
    userId: string,
    dto: {
      idNumber: string;
      dateOfBirth?: string;
      address?: string;
      documents: Array<{ documentType: KycDocumentType; fileUrl: string }>;
    },
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: { tenantId, userId },
    });

    if (!customer) throw new NotFoundException("Customer profile not found");

    const created = await this.prisma.$transaction(async (tx) => {
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          ghanaCardNumber: dto.idNumber,
          address: dto.address || customer.address,
          dateOfBirth: dto.dateOfBirth
            ? new Date(dto.dateOfBirth)
            : customer.dateOfBirth,
          kycStatus: "pending",
        },
      });

      return Promise.all(
        dto.documents.map((doc) =>
          tx.kycDocument.create({
            data: {
              customerId: customer.id,
              documentType: doc.documentType,
              fileUrl: doc.fileUrl,
              status: "pending",
            },
          }),
        ),
      );
    });

    await Promise.all(
      created.map((kycDoc) =>
        this.audit.log({
          tenantId,
          userId,
          action: "kyc:submit",
          resourceType: "kycDocument",
          resourceId: kycDoc.id,
          afterState: {
            documentType: kycDoc.documentType,
            status: "pending",
          },
        }),
      ),
    );

    return {
      customerId: customer.id,
      kycStatus: "pending" as const,
      documents: created,
    };
  }

  async findAll(tenantId: string, status?: DocumentStatus) {
    return this.prisma.kycDocument.findMany({
      where: {
        customer: {
          tenantId,
        },
        ...(status ? { status } : {}),
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async review(
    tenantId: string,
    id: string,
    status: DocumentStatus,
    reviewerId: string,
    rejectionReason?: string,
  ) {
    const doc = await this.prisma.kycDocument.findFirst({
      where: {
        id,
        customer: {
          tenantId,
        },
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!doc) {
      throw new NotFoundException("KYC document not found");
    }

    // Never return fileUrl in the response — base64 IDs are multi‑MB and hang proxies.
    const updatedDoc = await this.prisma.$transaction(async (tx) => {
      const next = await tx.kycDocument.update({
        where: { id },
        data: {
          status,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: status === "rejected" ? rejectionReason : null,
        },
        select: {
          id: true,
          customerId: true,
          documentType: true,
          status: true,
          rejectionReason: true,
          reviewedAt: true,
          reviewedById: true,
          createdAt: true,
        },
      });

      await tx.customer.update({
        where: { id: doc.customerId },
        data: {
          kycStatus: status === "approved" ? "verified" : "rejected",
          kycLevel: status === "approved" ? 2 : 1,
        },
      });

      return next;
    });

    await this.audit.log({
      tenantId,
      userId: reviewerId,
      action: "kyc:review",
      resourceType: "kycDocument",
      resourceId: id,
      beforeState: { status: doc.status },
      afterState: { status, rejectionReason },
    });

    const customerUser = doc.customer.user;
    if (customerUser) {
      const event = status === "approved" ? "kyc-approved" : "kyc-rejected";
      // Don't block the HTTP response on notification delivery.
      void enqueueNotification(
        this.notificationQueue,
        event,
        {
          tenantId,
          customerId: doc.customerId,
          userId: customerUser.id,
          documentId: id,
          documentType: doc.documentType,
          rejectionReason:
            status === "rejected" ? rejectionReason || null : null,
        },
        `${event}:${customerUser.id}:${id}`,
      ).catch(() => undefined);
    }

    return updatedDoc;
  }

  /** Approve/reject every pending document for a customer in one request. */
  async reviewCustomerBundle(
    tenantId: string,
    customerId: string,
    status: DocumentStatus,
    reviewerId: string,
    rejectionReason?: string,
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        kycDocuments: {
          where: { status: "pending" },
          select: { id: true, documentType: true, status: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    if (customer.kycDocuments.length === 0) {
      return {
        customerId,
        kycStatus: customer.kycStatus,
        reviewed: 0,
        documents: [],
      };
    }

    const reviewed = await this.prisma.$transaction(async (tx) => {
      const docs = [];
      for (const pending of customer.kycDocuments) {
        const next = await tx.kycDocument.update({
          where: { id: pending.id },
          data: {
            status,
            reviewedById: reviewerId,
            reviewedAt: new Date(),
            rejectionReason: status === "rejected" ? rejectionReason : null,
          },
          select: {
            id: true,
            customerId: true,
            documentType: true,
            status: true,
            rejectionReason: true,
            reviewedAt: true,
          },
        });
        docs.push(next);
      }

      await tx.customer.update({
        where: { id: customerId },
        data: {
          kycStatus: status === "approved" ? "verified" : "rejected",
          kycLevel: status === "approved" ? 2 : 1,
        },
      });

      return docs;
    });

    await this.audit.log({
      tenantId,
      userId: reviewerId,
      action: "kyc:review-bundle",
      resourceType: "customer",
      resourceId: customerId,
      afterState: {
        status,
        rejectionReason,
        documentIds: reviewed.map((d) => d.id),
        customerName:
          `${customer.user?.firstName ?? ""} ${customer.user?.lastName ?? ""}`.trim(),
        customerId,
      },
    });

    const customerUser = customer.user;
    if (customerUser) {
      const event = status === "approved" ? "kyc-approved" : "kyc-rejected";
      void enqueueNotification(
        this.notificationQueue,
        event,
        {
          tenantId,
          customerId,
          userId: customerUser.id,
          documentId: reviewed[0]?.id,
          documentType: reviewed[0]?.documentType,
          rejectionReason:
            status === "rejected" ? rejectionReason || null : null,
        },
        `${event}:${customerUser.id}:bundle:${customerId}`,
      ).catch(() => undefined);
    }

    return {
      customerId,
      kycStatus: status === "approved" ? "verified" : "rejected",
      reviewed: reviewed.length,
      documents: reviewed,
    };
  }
}
