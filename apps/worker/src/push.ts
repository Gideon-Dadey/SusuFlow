import {
  sendExpoPushNotifications,
  type ExpoPushMessage,
} from "@susuflow/shared";
import type { PrismaClient } from "@susuflow/database";

export const ANDROID_TRANSACTION_CHANNEL = "transactions";

export interface TransactionPushContent {
  title: string;
  body: string;
  data: Record<string, string>;
}

export function buildTransactionPushContent(
  event: string,
  firstName: string,
  tenantName: string,
  formattedAmount: string,
  reference: string,
  formattedBalance: string,
  transactionId: string,
): TransactionPushContent | null {
  const data = {
    type: event,
    reference,
    transactionId,
  };

  switch (event) {
    case "deposit-confirmed":
      return {
        title: "Deposit confirmed",
        body: `Hi ${firstName}, GHS ${formattedAmount} was credited to your ${tenantName} wallet. Balance: GHS ${formattedBalance}.`,
        data,
      };
    case "withdrawal-requested":
      return {
        title: "Withdrawal requested",
        body: `Your GHS ${formattedAmount} withdrawal is pending review. Ref: ${reference}.`,
        data,
      };
    case "withdrawal-approved":
      return {
        title: "Withdrawal approved",
        body: `GHS ${formattedAmount} was approved and is being sent. Balance: GHS ${formattedBalance}.`,
        data,
      };
    case "withdrawal-completed":
      return {
        title: "Withdrawal completed",
        body: `GHS ${formattedAmount} was sent successfully. Balance: GHS ${formattedBalance}.`,
        data,
      };
    case "withdrawal-rejected":
      return {
        title: "Withdrawal declined",
        body: `Your GHS ${formattedAmount} withdrawal was declined. Funds returned to your wallet.`,
        data,
      };
    case "kyc-approved":
      return {
        title: "Identity verified",
        body: `Hi ${firstName}, your identity verification with ${tenantName} was approved.`,
        data,
      };
    case "kyc-rejected":
      return {
        title: "Verification needs attention",
        body: `Hi ${firstName}, your identity verification with ${tenantName} was not approved. Please resubmit.`,
        data,
      };
    default:
      return null;
  }
}

export async function sendPushToUser(
  db: PrismaClient,
  userId: string,
  content: TransactionPushContent,
) {
  const tokens = await db.userPushToken.findMany({
    where: { userId },
    select: { id: true, token: true },
  });

  if (!tokens.length) {
    console.log(`[push] No tokens for user ${userId}`);
    return { sent: 0 };
  }

  const messages: ExpoPushMessage[] = tokens.map((row) => ({
    to: row.token,
    title: content.title,
    body: content.body,
    sound: "default",
    priority: "high",
    channelId: ANDROID_TRANSACTION_CHANNEL,
    data: content.data,
  }));

  const tickets = await sendExpoPushNotifications(messages);
  const staleTokenIds: string[] = [];

  tickets.forEach((ticket, index) => {
    if (ticket.status !== "error") return;
    const errorCode = ticket.details?.error;
    if (
      errorCode === "DeviceNotRegistered" ||
      errorCode === "InvalidCredentials"
    ) {
      const stale = tokens[index];
      if (stale) staleTokenIds.push(stale.id);
    }
    console.warn(`[push] Ticket error: ${ticket.message ?? errorCode}`);
  });

  if (staleTokenIds.length) {
    await db.userPushToken.deleteMany({ where: { id: { in: staleTokenIds } } });
  }

  const sent = tickets.filter((t) => t.status === "ok").length;
  console.log(`[push] Sent ${sent}/${tokens.length} to user ${userId}`);
  return { sent };
}
