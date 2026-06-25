export interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  sound?: "default" | null;
  priority?: "default" | "normal" | "high";
  channelId?: string;
  data?: Record<string, string>;
}

export interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const CHUNK_SIZE = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function sendExpoPushNotifications(
  messages: ExpoPushMessage[],
): Promise<ExpoPushTicket[]> {
  if (!messages.length) return [];

  const tickets: ExpoPushTicket[] = [];

  for (const batch of chunk(messages, CHUNK_SIZE)) {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Expo push failed (${response.status}): ${text}`);
    }

    const json = (await response.json()) as { data?: ExpoPushTicket[] };
    tickets.push(...(json.data ?? []));
  }

  return tickets;
}
