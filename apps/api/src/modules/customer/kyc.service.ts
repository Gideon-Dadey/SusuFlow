import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { DocumentStatus } from "@susuflow/database";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
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
      documentType: "ghana_card" | "passport" | "utility_bill" | "selfie";
      idNumber: string;
      dateOfBirth?: string;
      address?: string;
      fileUrl: string;
    },
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: { tenantId, userId },
    });

    if (!customer) throw new NotFoundException("Customer profile not found");

    await this.prisma.customer.update({
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

    const kycDoc = await this.prisma.kycDocument.create({
      data: {
        customerId: customer.id,
        documentType: dto.documentType,
        fileUrl: dto.fileUrl,
        status: "pending",
      },
    });

    await this.audit.log({
      tenantId,
      userId,
      action: "kyc:submit",
      resourceType: "kycDocument",
      resourceId: kycDoc.id,
      afterState: { documentType: dto.documentType, status: "pending" },
    });

    return kycDoc;
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
    });

    if (!doc) {
      throw new NotFoundException("KYC document not found");
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedDoc = await tx.kycDocument.update({
        where: { id },
        data: {
          status,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: status === "rejected" ? rejectionReason : null,
        },
      });

      // Update customer status
      await tx.customer.update({
        where: { id: doc.customerId },
        data: {
          kycStatus: status === "approved" ? "verified" : "rejected",
          kycLevel: status === "approved" ? 2 : 1,
        },
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

      return updatedDoc;
    });
  }
}
