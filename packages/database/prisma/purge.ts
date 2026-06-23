import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

config({ path: resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Purging mock data and non-admin users from database...');

  // 1. Fetch super admin user IDs to keep them
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'super_admin' },
  });

  if (!superAdminRole) {
    throw new Error('Super admin role not found in database.');
  }

  const superAdminUserRoles = await prisma.userRole.findMany({
    where: { roleId: superAdminRole.id },
    select: { userId: true },
  });

  const superAdminIds = superAdminUserRoles.map((ur) => ur.userId);
  console.log(`Found ${superAdminIds.length} super admin user(s) to preserve.`);

  // 2. Delete dependent tables first to respect foreign key constraints
  console.log('Deleting audit logs...');
  await prisma.auditLog.deleteMany({});

  console.log('Deleting fraud alerts...');
  await prisma.fraudAlert.deleteMany({});

  console.log('Deleting KYC documents...');
  await prisma.kycDocument.deleteMany({});

  console.log('Deleting customer plans...');
  await prisma.customerPlan.deleteMany({});

  console.log('Deleting ledger entries...');
  await prisma.ledgerEntry.deleteMany({});

  console.log('Deleting payments...');
  await prisma.payment.deleteMany({});

  console.log('Deleting withdrawals...');
  await prisma.withdrawal.deleteMany({});

  console.log('Deleting transactions...');
  await prisma.transaction.deleteMany({});

  console.log('Deleting accounts...');
  await prisma.account.deleteMany({});

  console.log('Deleting wallets...');
  await prisma.wallet.deleteMany({});

  console.log('Deleting customers...');
  await prisma.customer.deleteMany({});

  console.log('Deleting device fingerprints...');
  await prisma.device.deleteMany({});

  console.log('Deleting refresh tokens...');
  await prisma.refreshToken.deleteMany({});

  console.log('Deleting notifications...');
  await prisma.notification.deleteMany({});

  console.log('Deleting savings plans...');
  await prisma.savingsPlan.deleteMany({});

  console.log('Deleting subscriptions...');
  await prisma.subscription.deleteMany({});

  // 3. Delete non-admin user roles
  console.log('Deleting non-admin user roles...');
  await prisma.userRole.deleteMany({
    where: {
      userId: {
        notIn: superAdminIds,
      },
    },
  });

  // 4. Delete non-admin users
  console.log('Deleting non-admin users...');
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      id: {
        notIn: superAdminIds,
      },
    },
  });
  console.log(`Deleted ${deletedUsers.count} non-admin users.`);

  // 5. Delete all tenants
  console.log('Deleting all tenants...');
  const deletedTenants = await prisma.tenant.deleteMany({});
  console.log(`Deleted ${deletedTenants.count} tenants.`);

  console.log('Database purge complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
