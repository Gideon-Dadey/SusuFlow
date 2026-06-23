import { Prisma } from "@susuflow/database";
import { TENANT_CHART_OF_ACCOUNTS } from "@susuflow/shared";

type PrismaAccountClient = Pick<Prisma.TransactionClient, "account">;

export async function ensureTenantChartOfAccounts(
  prisma: PrismaAccountClient,
  tenantId: string,
): Promise<void> {
  for (const account of TENANT_CHART_OF_ACCOUNTS) {
    await prisma.account.upsert({
      where: { tenantId_code: { tenantId, code: account.code } },
      update: {},
      create: {
        tenantId,
        code: account.code,
        name: account.name,
        accountType: account.accountType,
        isSystem: true,
      },
    });
  }
}

export const SYSTEM_ACCOUNT_CODES = new Set<string>(
  TENANT_CHART_OF_ACCOUNTS.map((account) => account.code),
);
