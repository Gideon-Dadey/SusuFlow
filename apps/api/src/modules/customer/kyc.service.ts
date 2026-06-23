import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentStatus } from '@susuflow/database';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

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
        createdAt: 'desc',
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
      throw new NotFoundException('KYC document not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedDoc = await tx.kycDocument.update({
        where: { id },
        data: {
          status,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: status === 'rejected' ? rejectionReason : null,
        },
      });

      // Update customer status
      await tx.customer.update({
        where: { id: doc.customerId },
        data: {
          kycStatus: status === 'approved' ? 'verified' : 'rejected',
          kycLevel: status === 'approved' ? 2 : 1,
        },
      });

      await this.audit.log({
        tenantId,
        userId: reviewerId,
        action: 'kyc:review',
        resourceType: 'kycDocument',
        resourceId: id,
        beforeState: { status: doc.status },
        afterState: { status, rejectionReason },
      });

      return updatedDoc;
    });
  }
}

