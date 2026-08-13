import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Traditional susu: contributions stay locked until the cycle matures.
 * Staff-recorded withdrawals and admins may still override via staff create.
 * Env: WITHDRAWAL_ENFORCE_MATURITY=false disables the gate (default: true).
 */
export async function assertWithdrawalMaturityAllowed(
  prisma: PrismaService,
  tenantId: string,
  customerId: string,
): Promise<void> {
  if (process.env.WITHDRAWAL_ENFORCE_MATURITY === "false") {
    return;
  }

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, tenantId },
    select: { id: true },
  });
  if (!customer) {
    throw new NotFoundException("Customer not found");
  }

  const locked = await prisma.customerPlan.findFirst({
    where: {
      customerId,
      status: "active",
      endsAt: { gt: new Date() },
    },
    include: {
      plan: { select: { name: true } },
    },
    orderBy: { endsAt: "asc" },
  });

  if (!locked?.endsAt) {
    return;
  }

  const maturityDate = locked.endsAt.toISOString().slice(0, 10);
  throw new ForbiddenException(
    `This savings cycle (${locked.plan.name}) matures on ${maturityDate}. ` +
      "Withdrawals open after maturity, or when your susu company releases the funds.",
  );
}
