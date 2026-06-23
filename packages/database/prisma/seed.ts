import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

config({ path: resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

const ROLES = [
  { name: 'super_admin', description: 'Platform super administrator', isSystem: true },
  { name: 'company_admin', description: 'Susu company administrator', isSystem: true },
  { name: 'account_officer', description: 'Back-office account officer', isSystem: true },
  { name: 'collector', description: 'Cashless field collector agent', isSystem: true },
  { name: 'customer', description: 'End customer / saver', isSystem: true },
  { name: 'auditor', description: 'Read-only auditor', isSystem: true },
];

const PERMISSIONS = [
  { name: 'tenant:create', resource: 'tenant', action: 'create' },
  { name: 'tenant:read', resource: 'tenant', action: 'read' },
  { name: 'tenant:update', resource: 'tenant', action: 'update' },
  { name: 'tenant:suspend', resource: 'tenant', action: 'suspend' },
  { name: 'user:create', resource: 'user', action: 'create' },
  { name: 'user:read', resource: 'user', action: 'read' },
  { name: 'user:update', resource: 'user', action: 'update' },
  { name: 'user:delete', resource: 'user', action: 'delete' },
  { name: 'customer:create', resource: 'customer', action: 'create' },
  { name: 'customer:read', resource: 'customer', action: 'read' },
  { name: 'customer:update', resource: 'customer', action: 'update' },
  { name: 'deposit:create', resource: 'deposit', action: 'create' },
  { name: 'deposit:read', resource: 'deposit', action: 'read' },
  { name: 'withdrawal:create', resource: 'withdrawal', action: 'create' },
  { name: 'withdrawal:read', resource: 'withdrawal', action: 'read' },
  { name: 'withdrawal:approve', resource: 'withdrawal', action: 'approve' },
  { name: 'ledger:read', resource: 'ledger', action: 'read' },
  { name: 'audit:read', resource: 'audit', action: 'read' },
  { name: 'report:read', resource: 'report', action: 'read' },
  { name: 'report:export', resource: 'report', action: 'export' },
  { name: 'kyc:review', resource: 'kyc', action: 'review' },
  { name: 'fraud:read', resource: 'fraud', action: 'read' },
  { name: 'fraud:resolve', resource: 'fraud', action: 'resolve' },
  { name: 'settings:update', resource: 'settings', action: 'update' },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: PERMISSIONS.map((p) => p.name),
  company_admin: [
    'tenant:read', 'tenant:update', 'user:create', 'user:read', 'user:update', 'user:delete',
    'customer:create', 'customer:read', 'customer:update',
    'deposit:read', 'withdrawal:read', 'withdrawal:approve',
    'ledger:read', 'audit:read', 'report:read', 'report:export',
    'kyc:review', 'fraud:read', 'fraud:resolve', 'settings:update',
  ],
  account_officer: [
    'customer:create', 'customer:read', 'customer:update',
    'deposit:create', 'deposit:read', 'withdrawal:read',
    'ledger:read', 'report:read', 'kyc:review',
  ],
  collector: [
    'customer:create', 'customer:read',
    'deposit:create', 'deposit:read',
  ],
  customer: [
    'deposit:create', 'deposit:read',
    'withdrawal:create', 'withdrawal:read',
    'customer:read', 'customer:update',
  ],
  auditor: [
    'tenant:read', 'customer:read', 'deposit:read', 'withdrawal:read',
    'ledger:read', 'audit:read', 'report:read', 'report:export', 'fraud:read',
  ],
};

const CHART_OF_ACCOUNTS = [
  { code: '1000', name: 'Platform Cash', accountType: 'asset' as const },
  { code: '1100', name: 'Customer Wallets', accountType: 'liability' as const },
  { code: '1200', name: 'Collector Commissions Payable', accountType: 'liability' as const },
  { code: '2000', name: 'Withdrawals Pending', accountType: 'liability' as const },
  { code: '4000', name: 'Transaction Fee Revenue', accountType: 'revenue' as const },
  { code: '4100', name: 'Subscription Revenue', accountType: 'revenue' as const },
  { code: '5000', name: 'Commission Expense', accountType: 'expense' as const },
  { code: '5100', name: 'Payment Gateway Fees', accountType: 'expense' as const },
];

async function main() {
  console.log('Seeding SusuFlow database...');

  // Roles
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log('✓ Roles seeded');

  // Permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }
  console.log('✓ Permissions seeded');

  // Role-Permission mappings
  const roles = await prisma.role.findMany();
  const permissions = await prisma.permission.findMany();
  const permMap = Object.fromEntries(permissions.map((p) => [p.name, p.id]));

  for (const role of roles) {
    const permNames = ROLE_PERMISSIONS[role.name] || [];
    for (const permName of permNames) {
      const permissionId = permMap[permName];
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: { roleId: role.id, permissionId },
      });
    }
  }
  console.log('✓ Role permissions seeded');

  // Super Admin
  const superAdminRole = roles.find((r) => r.name === 'super_admin')!;
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@susuflow.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(superAdminPassword, 12);

  let superAdmin = await prisma.user.findFirst({
    where: { email: superAdminEmail || 'admin@susuflow.com', tenantId: null },
  });

  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail || 'admin@susuflow.com',
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        status: 'active',
        emailVerified: true,
      },
    });
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: superAdmin.id, roleId: superAdminRole.id },
  });
  console.log('✓ Super admin seeded');

  console.log('\nSeed complete!');
  console.log('\nCredentials:');
  console.log(`  Super Admin: ${superAdminEmail} / ${superAdminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
