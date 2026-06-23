import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertStatus } from '@susuflow/database';
import { AuditService } from './audit.service';

@Injectable()
export class FraudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(tenantId: string, status?: AlertStatus) {
    return this.prisma.fraudAlert.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {}),
      },
      include: {
        resolvedBy: {
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

  async resolve(
    tenantId: string,
    id: string,
    status: AlertStatus,
    resolvedById: string,
    resolutionNotes?: string,
  ) {
    const alert = await this.prisma.fraudAlert.findFirst({
      where: { id, tenantId },
    });

    if (!alert) {
      throw new NotFoundException('Fraud alert not found');
    }

    const currentDetails = (alert.details as Record<string, any>) || {};
    const updatedDetails = {
      ...currentDetails,
      resolutionNotes: resolutionNotes || 'Resolved by administrative staff',
    };

    const updatedAlert = await this.prisma.fraudAlert.update({
      where: { id },
      data: {
        status,
        resolvedById,
        resolvedAt: new Date(),
        details: updatedDetails,
      },
    });

    await this.audit.log({
      tenantId,
      userId: resolvedById,
      action: 'fraud:resolve',
      resourceType: 'fraudAlert',
      resourceId: id,
      beforeState: { status: alert.status },
      afterState: { status, resolutionNotes },
    });

    return updatedAlert;
  }
}

