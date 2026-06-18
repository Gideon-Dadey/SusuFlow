export type RedisConnectionOptions = {
  host: string;
  port: number;
  username?: string;
  password?: string;
  tls?: Record<string, never>;
  maxRetriesPerRequest: number | null;
};

/** Parse REDIS_URL for ioredis / BullMQ (supports redis:// and rediss://). */
export function getRedisConnectionOptions(): RedisConnectionOptions {
  const url = process.env.REDIS_URL;
  if (url) {
    const parsed = new URL(url);
    const options: RedisConnectionOptions = {
      host: parsed.hostname,
      port: Number(parsed.port || 6379),
      maxRetriesPerRequest: null,
    };
    if (parsed.username) options.username = decodeURIComponent(parsed.username);
    if (parsed.password) options.password = decodeURIComponent(parsed.password);
    if (parsed.protocol === 'rediss:') options.tls = {};
    return options;
  }

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379),
    maxRetriesPerRequest: null,
  };
}
