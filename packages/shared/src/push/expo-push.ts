export interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  subtitle?: string;
  sound?: "default" | null;
  priority?: "default" | "normal" | "high";
  channelId?: string;
  categoryId?: string;
  badge?: number;
  ttl?: number;
  collapseId?: string;
  interruptionLevel?: "passive" | "active" | "time-sensitive" | "critical";
  data?: Record<string, string>;
}

export interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

export interface ExpoPushReceipt {
  status: "ok" | "error";
  message?: string;
  details?: { error?: string };
}

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_RECEIPTS_URL = "https://exp.host/--/api/v2/push/getReceipts";
const CHUNK_SIZE = 100;
const RECEIPT_CHUNK_SIZE = 300;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function expoHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Encoding": "gzip, deflate",
    "Content-Type": "application/json",
  };
  const accessToken = process.env.EXPO_ACCESS_TOKEN?.trim();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: expoHeaders(),
        body: JSON.stringify(body),
      });

      if (response.status === 429 || response.status >= 500) {
        const text = await response.text().catch(() => "");
        lastError = new Error(`Expo push failed (${response.status}): ${text}`);
        await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
        continue;
      }

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Expo push failed (${response.status}): ${text}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === 2) throw lastError;
      await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
    }
  }

  throw lastError ?? new Error("Expo push failed");
}

export async function sendExpoPushNotifications(
  messages: ExpoPushMessage[],
): Promise<ExpoPushTicket[]> {
  if (!messages.length) return [];

  const tickets: ExpoPushTicket[] = [];

  for (const batch of chunk(messages, CHUNK_SIZE)) {
    const json = await postJson<{ data?: ExpoPushTicket[] }>(
      EXPO_PUSH_URL,
      batch,
    );
    tickets.push(...(json.data ?? []));
  }

  return tickets;
}

export async function fetchExpoPushReceipts(
  ticketIds: string[],
): Promise<Record<string, ExpoPushReceipt>> {
  const ids = ticketIds.filter(Boolean);
  if (!ids.length) return {};

  const receipts: Record<string, ExpoPushReceipt> = {};

  for (const batch of chunk(ids, RECEIPT_CHUNK_SIZE)) {
    const json = await postJson<{ data?: Record<string, ExpoPushReceipt> }>(
      EXPO_RECEIPTS_URL,
      { ids: batch },
    );
    Object.assign(receipts, json.data ?? {});
  }

  return receipts;
}
