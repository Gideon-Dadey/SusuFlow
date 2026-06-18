import { config } from 'dotenv';
import { resolve } from 'path';
import { Worker } from 'bullmq';
import { getRedisConnectionOptions } from '@susuflow/shared';

config({ path: resolve(__dirname, '../../../.env') });

const connection = getRedisConnectionOptions();

console.log('SusuFlow worker starting...');

const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    console.log(`[notifications] Processing job ${job.id}:`, job.data);
    // Phase 2: integrate SendGrid / SMS provider
    return { sent: true, channel: 'mock' };
  },
  { connection },
);

const receiptWorker = new Worker(
  'receipts',
  async (job) => {
    console.log(`[receipts] Generating receipt for job ${job.id}:`, job.data);
    // Phase 2: generate PDF and upload to S3
    return { generated: true, reference: job.data.reference };
  },
  { connection },
);

notificationWorker.on('completed', (job) => {
  console.log(`[notifications] Job ${job.id} completed`);
});

receiptWorker.on('completed', (job) => {
  console.log(`[receipts] Job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`[notifications] Job ${job?.id} failed:`, err.message);
});

receiptWorker.on('failed', (job, err) => {
  console.error(`[receipts] Job ${job?.id} failed:`, err.message);
});

console.log('Workers listening on queues: notifications, receipts');

process.on('SIGTERM', async () => {
  await notificationWorker.close();
  await receiptWorker.close();
  process.exit(0);
});
