import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient, Prisma } from "@prisma/client";

config({ path: resolve(__dirname, "../../../.env") });

const prisma = new PrismaClient();
const EIGHT_DIGIT = /^\d{8}$/;
const apply = process.argv.includes("--apply");

function nextEightDigit(used: Set<string>): string {
  let reference = "";
  do {
    reference = String(10_000_000 + Math.floor(Math.random() * 90_000_000));
  } while (used.has(reference));
  used.add(reference);
  return reference;
}

function withPreviousReference(
  metadata: Prisma.JsonValue,
  previousReference: string,
): Prisma.InputJsonValue {
  const base =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? { ...(metadata as Record<string, unknown>) }
      : {};
  return {
    ...base,
    previousReference,
  } as Prisma.InputJsonValue;
}

async function main() {
  const transactions = await prisma.transaction.findMany({
    select: { id: true, reference: true, metadata: true },
    orderBy: { createdAt: "asc" },
  });

  const used = new Set(
    transactions
      .map((row) => row.reference)
      .filter((reference) => EIGHT_DIGIT.test(reference)),
  );

  const pending = transactions.filter(
    (row) => !EIGHT_DIGIT.test(row.reference),
  );

  console.log(
    `${apply ? "Applying" : "Dry run"}: ${pending.length} of ${transactions.length} transaction references need an 8-digit value.`,
  );

  if (pending.length === 0) {
    console.log("All transaction references are already 8 digits.");
    return;
  }

  let updated = 0;
  for (const row of pending) {
    const next = nextEightDigit(used);
    console.log(`${row.reference} -> ${next}`);

    if (!apply) continue;

    await prisma.transaction.update({
      where: { id: row.id },
      data: {
        reference: next,
        metadata: withPreviousReference(row.metadata, row.reference),
      },
    });
    updated += 1;
  }

  if (apply) {
    console.log(`Updated ${updated} transaction reference(s).`);
  } else {
    console.log("Dry run only. Re-run with --apply to write changes.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
