import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { ROLES } from "@susuflow/shared";
import { PlanService } from "../plan/plan.service";

@Injectable()
export class DemoSeederService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planService: PlanService,
  ) {}

  async seedDemoData(tenantSlug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantSlug} not found`);
    }

    const tenantId = tenant.id;

    await this.planService.seedDefaultPlans(tenantId);

    // Clean existing data for this tenant to make it idempotent
    await this.prisma.$executeRawUnsafe(
      `TRUNCATE TABLE audit_logs, fraud_alerts, kyc_documents, customer_plans, ledger_entries, transactions, wallets, customers CASCADE;`,
    );

    // Let's re-create customer wallets account code 1100 or other systems.
    // Wait, let's find the collector user nana@abcsusu.com
    const collector = await this.prisma.user.findFirst({
      where: { tenantId, email: "nana@abcsusu.com" },
    });
    if (!collector) {
      throw new NotFoundException(
        "Demo collector user not found. Run seed script first.",
      );
    }

    const companyAdmin = await this.prisma.user.findFirst({
      where: { tenantId, email: "admin@abcsusu.com" },
    });
    const companyAdminId = companyAdmin ? companyAdmin.id : undefined;

    // Fetch the customer role
    const customerRole = await this.prisma.role.findUnique({
      where: { name: ROLES.CUSTOMER },
    });
    if (!customerRole) {
      throw new Error("Customer role not configured");
    }

    // 1. Create mock customers
    const mockCustomers = [
      {
        firstName: "Kofi",
        lastName: "Mensah",
        email: "kofi@example.com",
        phone: "+233245678901",
        card: "GHA-712345678-1",
      },
      {
        firstName: "Abena",
        lastName: "Osei",
        email: "abena@example.com",
        phone: "+233245678902",
        card: "GHA-712345678-2",
      },
      {
        firstName: "Kwame",
        lastName: "Asante",
        email: "kwame@example.com",
        phone: "+233245678903",
        card: "GHA-712345678-3",
      },
      {
        firstName: "Akua",
        lastName: "Addo",
        email: "akua@example.com",
        phone: "+233245678904",
        card: "GHA-712345678-4",
      },
      {
        firstName: "Yaw",
        lastName: "Boateng",
        email: "yaw@example.com",
        phone: "+233245678905",
        card: "GHA-712345678-5",
      },
    ];

    const customerIds: string[] = [];
    const customerAccounts: any[] = [];

    const pwdHash = await bcrypt.hash("ChangeMe123!", 12);

    for (let i = 0; i < mockCustomers.length; i++) {
      const mc = mockCustomers[i];

      const user = await this.prisma.user.create({
        data: {
          tenantId,
          email: mc.email,
          phone: mc.phone,
          passwordHash: pwdHash,
          firstName: mc.firstName,
          lastName: mc.lastName,
          status: "active",
          emailVerified: true,
        },
      });

      await this.prisma.userRole.create({
        data: { userId: user.id, roleId: customerRole.id, tenantId },
      });

      const customer = await this.prisma.customer.create({
        data: {
          tenantId,
          userId: user.id,
          customerNumber: `CUS-${String(i + 1).padStart(6, "0")}`,
          ghanaCardNumber: mc.card,
          dateOfBirth: new Date("1995-05-15"),
          address: "Accra, Ghana",
          collectorId: collector.id,
          onboardedById: collector.id,
          status: "active",
          kycLevel: i === 2 ? 2 : 1,
          kycStatus: i === 2 ? "verified" : "pending",
        },
      });

      const wallet = await this.prisma.wallet.create({
        data: { tenantId, customerId: customer.id, walletType: "customer" },
      });

      const account = await this.prisma.account.create({
        data: {
          tenantId,
          walletId: wallet.id,
          code: `1100-${customer.id.slice(0, 5)}`,
          name: `Wallet: ${mc.firstName} ${mc.lastName}`,
          accountType: "liability",
        },
      });

      customerIds.push(customer.id);
      customerAccounts.push(account);
    }

    // 2. Fetch Daily Susu plan
    const dailySusuPlan = await this.prisma.savingsPlan.findFirst({
      where: { tenantId, name: "Daily Susu" },
    });

    if (dailySusuPlan) {
      // Enroll Kofi, Abena, Kwame
      for (let i = 0; i < 3; i++) {
        await this.prisma.customerPlan.create({
          data: {
            customerId: customerIds[i],
            planId: dailySusuPlan.id,
            targetAmount: 500,
            status: "active",
            startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          },
        });
      }
    }

    // 3. Seed Chart of Accounts helper models if they somehow don't exist
    const systemAccounts = [
      { code: "1000", name: "Platform Cash", type: "asset" },
      {
        code: "1200",
        name: "Collector Commissions Payable",
        type: "liability",
      },
      { code: "5000", name: "Commission Expense", type: "expense" },
    ];

    const accountInstances: Record<string, any> = {};
    for (const sa of systemAccounts) {
      let acc = await this.prisma.account.findFirst({
        where: { tenantId, code: sa.code },
      });
      if (!acc) {
        acc = await this.prisma.account.create({
          data: {
            tenantId,
            code: sa.code,
            name: sa.name,
            accountType: sa.type as any,
            isSystem: true,
          },
        });
      }
      accountInstances[sa.code] = acc;
    }

    // 4. Generate deposits and withdrawals over the last 5 days
    const days = 5;
    const transactions = [];

    for (let day = 0; day < days; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      // Create a few deposits per day
      for (let i = 0; i < 2; i++) {
        const custIndex = (day + i) % customerIds.length;
        const customerId = customerIds[custIndex];
        const customerAccount = customerAccounts[custIndex];
        const amount = 50 + Math.floor(Math.random() * 100);

        const ref = `DEP-${date.getTime()}-${i}`;
        const tx = await this.prisma.transaction.create({
          data: {
            tenantId,
            reference: ref,
            type: "deposit",
            status: "completed",
            amount,
            customerId,
            collectorId: collector.id,
            createdAt: date,
            completedAt: date,
          },
        });

        // Double-entry: Debit 1000 Cash, Credit 1100 Customer Liability
        await this.prisma.ledgerEntry.createMany({
          data: [
            {
              tenantId,
              transactionId: tx.id,
              accountId: accountInstances["1000"].id,
              entryType: "debit",
              amount,
              description: `Deposit: ${ref}`,
              createdAt: date,
            },
            {
              tenantId,
              transactionId: tx.id,
              accountId: customerAccount.id,
              entryType: "credit",
              amount,
              description: `Deposit: ${ref}`,
              createdAt: date,
            },
          ],
        });

        // Commission (1%)
        const commission = Math.round(amount * 0.01 * 100) / 100;
        if (commission > 0) {
          // Debit 5000 Expense, Credit 1200 Payable
          await this.prisma.ledgerEntry.createMany({
            data: [
              {
                tenantId,
                transactionId: tx.id,
                accountId: accountInstances["5000"].id,
                entryType: "debit",
                amount: commission,
                description: "Collector commission",
                createdAt: date,
              },
              {
                tenantId,
                transactionId: tx.id,
                accountId: accountInstances["1200"].id,
                entryType: "credit",
                amount: commission,
                description: "Collector commission",
                createdAt: date,
              },
            ],
          });
        }
      }

      // Add a withdrawal every other day
      if (day % 2 === 0) {
        const custIndex = day % customerIds.length;
        const customerId = customerIds[custIndex];
        const customerAccount = customerAccounts[custIndex];
        const amount = 20;

        const ref = `WTH-${date.getTime()}`;
        const tx = await this.prisma.transaction.create({
          data: {
            tenantId,
            reference: ref,
            type: "withdrawal",
            status: "completed",
            amount,
            customerId,
            createdAt: date,
            completedAt: date,
          },
        });

        // Double-entry: Debit 1100 Customer Liability, Credit 1000 Platform Cash
        await this.prisma.ledgerEntry.createMany({
          data: [
            {
              tenantId,
              transactionId: tx.id,
              accountId: customerAccount.id,
              entryType: "debit",
              amount,
              description: `Withdrawal: ${ref}`,
              createdAt: date,
            },
            {
              tenantId,
              transactionId: tx.id,
              accountId: accountInstances["1000"].id,
              entryType: "credit",
              amount,
              description: `Withdrawal: ${ref}`,
              createdAt: date,
            },
          ],
        });
      }
    }

    // 5. Seed KYC Document submissions
    // Kofi (Ghana Card) - pending
    await this.prisma.kycDocument.create({
      data: {
        customerId: customerIds[0],
        documentType: "ghana_card",
        fileUrl:
          "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=600",
        status: "pending",
      },
    });

    // Abena (Selfie) - pending
    await this.prisma.kycDocument.create({
      data: {
        customerId: customerIds[1],
        documentType: "selfie",
        fileUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600",
        status: "pending",
      },
    });

    // Kwame (Utility Bill) - approved
    await this.prisma.kycDocument.create({
      data: {
        customerId: customerIds[2],
        documentType: "utility_bill",
        fileUrl:
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600",
        status: "approved",
        reviewedById: companyAdminId,
        reviewedAt: new Date(),
      },
    });

    // Akua (Ghana Card) - rejected
    await this.prisma.kycDocument.create({
      data: {
        customerId: customerIds[3],
        documentType: "ghana_card",
        fileUrl:
          "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=600",
        status: "rejected",
        reviewedById: companyAdminId,
        reviewedAt: new Date(),
        rejectionReason:
          "The text is blurry and illegible. Please submit a clearer photo.",
      },
    });

    // 6. Seed Fraud Alerts
    await this.prisma.fraudAlert.createMany({
      data: [
        {
          tenantId,
          rule: "HIGH_DEPOSIT_VELOCITY",
          severity: "high",
          status: "open",
          resourceType: "Customer",
          resourceId: customerIds[0],
          details: {
            customerName: "Kofi Mensah",
            warning: "Single day deposit exceeded maximum standard threshold",
            velocityIndex: "2.5x standard limit",
          },
        },
        {
          tenantId,
          rule: "MULTIPLE_IP_LOGINS",
          severity: "medium",
          status: "open",
          resourceType: "User",
          resourceId: collector.id,
          details: {
            userEmail: "nana@abcsusu.com",
            ipsLogged: ["197.251.12.3", "197.251.144.92"],
            timeWindowMinutes: 5,
          },
        },
      ],
    });

    // 7. Seed Audit Logs
    await this.prisma.auditLog.createMany({
      data: [
        {
          tenantId,
          userId: companyAdminId,
          action: "user:login",
          resourceType: "user",
          resourceId: companyAdminId,
          ipAddress: "197.251.12.50",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        {
          tenantId,
          userId: collector.id,
          action: "customer:create",
          resourceType: "customer",
          resourceId: customerIds[0],
          ipAddress: "197.251.14.88",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        },
        {
          tenantId,
          userId: companyAdminId,
          action: "kyc:review",
          resourceType: "kycDocument",
          resourceId: customerIds[2],
          ipAddress: "197.251.12.50",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      ],
    });

    return {
      message:
        "Demo seeder executed successfully. All dashboard metrics initialized!",
    };
  }
}
