# 📘 SusuFlow — Financial General Ledger & Accounting Operations Manual

**Document Reference**: `SusuFlow-FIN-2026-MANUAL`  
**Target Audience**: Financial Auditors, System Architects, Accountants, Chief Financial Officers

---

## 1. Core Double-Entry Accounting Architecture

SusuFlow operates on an enterprise **Double-Entry General Ledger (GL) System**. In accordance with GAAP and IFRS financial accounting standards, every monetary event creates equal and balancing **debit** and **credit** entries across specialized accounts.

### 1.1 Chart of Accounts (COA) Structure

Each tenant organization maintains a isolated Chart of Accounts:

| Account Code      | Account Name                        | Type      | Normal Balance | Description                                                                   |
| :---------------- | :---------------------------------- | :-------- | :------------- | :---------------------------------------------------------------------------- |
| `1000`            | Cash & Mobile Money Operations      | Asset     | Debit          | Holds physical cash collected or incoming Mobile Money float.                 |
| `1100-{walletId}` | Customer Wallet Account             | Liability | Credit         | Represents funds owed by the Susu company to an individual customer.          |
| `4000`            | Collector Commission Revenue        | Revenue   | Credit         | Holds company revenue earned from Susu collector service fees.                |
| `5000`            | Gateway & MoMo Transaction Expenses | Expense   | Debit          | Holds processing fees charged by external payment gateways (Hubtel/Paystack). |

---

## 2. Transaction Workflows & Ledger Postings

### 2.1 Customer Deposit Event (GH₵1,000.00)

When a customer deposits GH₵1,000.00 via Mobile Money or Field Collector:

1. **Transaction Entry**:
   - `Transaction` table receives a record with `status: 'completed'`, `amount: 1000.00`, `reference: 'DEP_1785275513066'`.

2. **Ledger Postings (`LedgerEntry` table)**:

   ```sql
   -- 1. Debit Cash/MoMo Operations (Asset Increases)
   INSERT INTO "LedgerEntry" ("tenantId", "transactionId", "accountId", "entryType", "amount", "description")
   VALUES ('adipa-tenant-id', 'tx-uuid-1', 'account-1000-id', 'debit', 1000.00, 'Deposit DEP_1785275513066');

   -- 2. Credit Customer Wallet Liability (Liability Owed to Customer Increases)
   INSERT INTO "LedgerEntry" ("tenantId", "transactionId", "accountId", "entryType", "amount", "description")
   VALUES ('adipa-tenant-id', 'tx-uuid-1', 'account-1100-id', 'credit', 1000.00, 'Deposit DEP_1785275513066');
   ```

### 2.2 Customer Withdrawal Event (GH₵500.00)

When a customer withdraws GH₵500.00 from their wallet:

1. **Ledger Postings**:

   ```sql
   -- 1. Debit Customer Wallet Liability (Liability Owed Decreases)
   INSERT INTO "LedgerEntry" ("tenantId", "transactionId", "accountId", "entryType", "amount", "description")
   VALUES ('adipa-tenant-id', 'tx-uuid-2', 'account-1100-id', 'debit', 500.00, 'Withdrawal WTH_9012');

   -- 2. Credit Cash/MoMo Operations (Asset Decreases)
   INSERT INTO "LedgerEntry" ("tenantId", "transactionId", "accountId", "entryType", "amount", "description")
   VALUES ('adipa-tenant-id', 'tx-uuid-2', 'account-1000-id', 'credit', 500.00, 'Withdrawal WTH_9012');
   ```

---

## 3. Real-Time Balance Calculation Engine

SusuFlow **never** relies on mutable balance columns in database rows. Instead, wallet balances are calculated dynamically from verified ledger entries:

$$\text{Customer Wallet Balance} = \sum \text{Credits (Liability)} - \sum \text{Debits (Liability)}$$

### Code Reference (`apps/api/src/modules/ledger/ledger.service.ts`):

```ts
async getAccountBalance(accountId: string): Promise<number> {
  const account = await this.prisma.account.findUnique({ where: { id: accountId } });
  const sums = await this.prisma.ledgerEntry.groupBy({
    by: ['entryType'],
    where: { accountId },
    _sum: { amount: true },
  });

  const debitTotal = Number(sums.find((s) => s.entryType === 'debit')?._sum?.amount ?? 0);
  const creditTotal = Number(sums.find((s) => s.entryType === 'credit')?._sum?.amount ?? 0);

  const isNormalCredit = ['liability', 'revenue', 'equity'].includes(account.accountType);
  return isNormalCredit ? creditTotal - debitTotal : debitTotal - creditTotal;
}
```

---

## 4. Audit & Discrepancy Reconciliation Runbook

### Scenario: Transaction List Count vs Wallet Balance Discrepancy

If a transaction appears in the `Transaction` table but does not reflect in `walletData.balance`:

1. Check if corresponding `LedgerEntry` postings exist for that `transactionId`.
2. Inspect whether the transaction was executed during a network outage or partial API timeout.
3. Run the automated ledger sync utility or trigger Bank & MoMo Reconciliation (`/staff/reconciliation`).
