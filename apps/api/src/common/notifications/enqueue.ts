import type { JobsOptions, Queue } from "bullmq";

export const NOTIFICATION_JOB_OPTIONS: JobsOptions = {
  attempts: 5,
  backoff: { type: "exponential", delay: 2500 },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 2000 },
};

export async function enqueueNotification(
  queue: Queue,
  event: string,
  data: Record<string, unknown>,
  uniqueKey?: string,
) {
  return queue.add(event, data, {
    ...NOTIFICATION_JOB_OPTIONS,
    jobId: uniqueKey ? `${event}:${uniqueKey}` : undefined,
  });
}
