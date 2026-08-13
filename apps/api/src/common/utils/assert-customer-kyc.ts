import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Money APIs must enforce KYC server-side — never rely on the mobile gate alone.
 */
export async function assertCustomerKycVerified(
  prisma: PrismaService,
  tenantId: string,
  customerId: string,
): Promise<void> {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, tenantId },
    select: { kycStatus: true },
  });

  if (!customer) {
    throw new NotFoundException("Customer not found");
  }

  if (customer.kycStatus !== "verified") {
    throw new ForbiddenException(
      customer.kycStatus === "pending"
        ? "Your identity check is still under review. Deposits and withdrawals unlock after approval."
        : customer.kycStatus === "rejected"
          ? "Your identity check was rejected. Update your KYC documents, then try again."
          : "Complete identity verification (KYC) before moving money.",
    );
  }
}
