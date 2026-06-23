import { config } from 'dotenv';
import { resolve } from 'path';
import { Worker } from 'bullmq';
import { getRedisConnectionOptions } from '@susuflow/shared';
import { db } from '@susuflow/database';

config({ path: resolve(__dirname, '../../../.env') });

const connection = getRedisConnectionOptions();

console.log('SusuFlow worker starting...');

async function sendSMS(to: string, message: string, tenantId: string) {
  const isDev = process.env.NODE_ENV === 'development' || !process.env.SMS_API_KEY;
  const cleanPhone = to.startsWith('0') ? '+233' + to.slice(1) : to;

  if (isDev) {
    console.log(`[SMS MOCK] To: ${cleanPhone} | Message: "${message}"`);
    return { success: true, provider: 'mock' };
  }

  const provider = process.env.SMS_PROVIDER || 'hubtel';

  try {
    if (provider === 'twilio') {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_PHONE_NUMBER || 'SusuFlow';
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: cleanPhone,
          From: from,
          Body: message,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } else {
      const apiKey = process.env.SMS_API_KEY;
      const senderId = process.env.SMS_SENDER_ID || 'SusuFlow';
      const response = await fetch(`https://smsc.hubtel.com/v1/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${apiKey}`,
        },
        body: JSON.stringify({
          From: senderId,
          To: cleanPhone,
          Content: message,
          RegisteredDelivery: true,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    }
  } catch (err: any) {
    console.error(`[SMS FAILED] Error sending SMS to ${cleanPhone}:`, err.message);
    return { success: false, error: err.message };
  }
}

async function sendEmail(to: string, subject: string, htmlContent: string) {
  const isDev = process.env.NODE_ENV === 'development' || !process.env.SENDGRID_API_KEY;

  if (isDev) {
    console.log(`[EMAIL MOCK] To: ${to} | Subject: "${subject}" | Content Preview: ${htmlContent.replace(/\s+/g, ' ').slice(0, 100)}...`);
    return { success: true, provider: 'mock' };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.SENDER_EMAIL || 'no-reply@susuflow.com', name: 'SusuFlow Portal' },
        subject: subject,
        content: [{ type: 'text/html', value: htmlContent }],
      }),
    });

    return { success: response.ok };
  } catch (err: any) {
    console.error(`[EMAIL FAILED] Error sending email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    console.log(`[notifications] Processing job ${job.id} (${job.name}):`, job.data);
    const { tenantId, transactionId } = job.data;
    
    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        tenant: true,
        withdrawal: true,
      },
    });

    if (!transaction || !transaction.customer || !transaction.customer.user) {
      console.warn(`[notifications] Transaction ${transactionId} or customer not found. Skipping.`);
      return { sent: false, error: 'Transaction or customer not found' };
    }

    const customerUser = transaction.customer.user;
    const customerName = `${customerUser.firstName} ${customerUser.lastName}`;
    const tenantName = transaction.tenant.name;
    const amount = Number(transaction.amount);
    const reference = transaction.reference;
    const phone = customerUser.phone;
    const email = customerUser.email;

    // Fetch current wallet balance
    const accounts = await db.account.findMany({ where: { walletId: transaction.walletId! } });
    let walletBalance = 0;
    for (const account of accounts) {
      const sums = await db.ledgerEntry.groupBy({
        by: ['entryType'],
        where: { accountId: account.id },
        _sum: { amount: true },
      });
      const debitTotal = Number(sums.find((s) => s.entryType === 'debit')?._sum?.amount ?? 0);
      const creditTotal = Number(sums.find((s) => s.entryType === 'credit')?._sum?.amount ?? 0);
      const isNormalCredit = ['liability', 'revenue', 'equity'].includes(account.accountType);
      walletBalance += isNormalCredit ? creditTotal - debitTotal : debitTotal - creditTotal;
    }
    const formattedBalance = (Math.round(walletBalance * 100) / 100).toFixed(2);
    const formattedAmount = amount.toFixed(2);

    let customerSms = '';
    let customerEmailSubject = '';
    let customerEmailHtml = '';
    
    let adminEmailSubject = '';
    let adminEmailHtml = '';

    if (job.name === 'deposit-confirmed') {
      customerSms = `Hello ${customerUser.firstName}, your deposit of GHS ${formattedAmount} was confirmed successfully for your ${tenantName} savings plan. Tx Ref: ${reference}. Current Balance: GHS ${formattedBalance}.`;
      customerEmailSubject = `Deposit Confirmed - ${tenantName}`;
      customerEmailHtml = `
        <h3>Deposit Confirmed</h3>
        <p>Hello ${customerUser.firstName},</p>
        <p>Your deposit of <strong>GHS ${formattedAmount}</strong> has been successfully credited to your wallet at <strong>${tenantName}</strong>.</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p><strong>Current Wallet Balance:</strong> GHS ${formattedBalance}</p>
        <p>Thank you for saving with us!</p>
      `;

      adminEmailSubject = `New Confirmed Deposit - ${tenantName}`;
      adminEmailHtml = `
        <h3>Confirmed Customer Deposit</h3>
        <p>A new deposit has been completed on the platform.</p>
        <ul>
          <li><strong>Organization:</strong> ${tenantName}</li>
          <li><strong>Customer:</strong> ${customerName} (${customerUser.email})</li>
          <li><strong>Amount:</strong> GHS ${formattedAmount}</li>
          <li><strong>Reference:</strong> ${reference}</li>
          <li><strong>Updated Customer Balance:</strong> GHS ${formattedBalance}</li>
        </ul>
      `;
    } 
    else if (job.name === 'withdrawal-requested') {
      const wd = transaction.withdrawal;
      const targetPhone = wd?.disbursementPhone || phone || 'N/A';
      const targetMethod = wd?.disbursementMethod || 'Momo';

      customerSms = `Hello ${customerUser.firstName}, your withdrawal request of GHS ${formattedAmount} has been received and is pending review by ${tenantName}. Tx Ref: ${reference}.`;
      customerEmailSubject = `Withdrawal Request Received - ${tenantName}`;
      customerEmailHtml = `
        <h3>Withdrawal Request Pending Review</h3>
        <p>Hello ${customerUser.firstName},</p>
        <p>Your request to withdraw <strong>GHS ${formattedAmount}</strong> to ${targetPhone} via ${targetMethod} has been received and is currently pending approval by ${tenantName}.</p>
        <p><strong>Reference:</strong> ${reference}</p>
      `;

      adminEmailSubject = `Action Required: New Withdrawal Request - ${tenantName}`;
      adminEmailHtml = `
        <h3>New Withdrawal Request Pending Approval</h3>
        <p>A saver has requested a cash withdrawal that requires administrative review.</p>
        <ul>
          <li><strong>Organization:</strong> ${tenantName}</li>
          <li><strong>Customer:</strong> ${customerName} (${customerUser.email})</li>
          <li><strong>Amount:</strong> GHS ${formattedAmount}</li>
          <li><strong>Disbursement Method:</strong> ${targetMethod}</li>
          <li><strong>Disbursement Target:</strong> ${targetPhone}</li>
          <li><strong>Reference:</strong> ${reference}</li>
        </ul>
        <p>Please log into your dashboard to approve or reject this request.</p>
      `;
    }
    else if (job.name === 'withdrawal-approved') {
      const wd = transaction.withdrawal;
      const targetPhone = wd?.disbursementPhone || phone || 'N/A';
      const targetMethod = wd?.disbursementMethod || 'Momo';

      customerSms = `Hello ${customerUser.firstName}, your withdrawal request of GHS ${formattedAmount} has been APPROVED by ${tenantName}! Funds are being sent to ${targetPhone} via ${targetMethod}. Tx Ref: ${reference}.`;
      customerEmailSubject = `Withdrawal Approved - ${tenantName}`;
      customerEmailHtml = `
        <h3>Withdrawal Request Approved</h3>
        <p>Hello ${customerUser.firstName},</p>
        <p>Great news! Your withdrawal request for <strong>GHS ${formattedAmount}</strong> has been approved by ${tenantName}.</p>
        <p>The funds are being transferred to <strong>${targetPhone}</strong> via <strong>${targetMethod}</strong>.</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p><strong>New Wallet Balance:</strong> GHS ${formattedBalance}</p>
      `;

      adminEmailSubject = `Withdrawal Approved & Disbursed - ${tenantName}`;
      adminEmailHtml = `
        <h3>Withdrawal Request Completed</h3>
        <p>A customer withdrawal request has been approved and processed.</p>
        <ul>
          <li><strong>Organization:</strong> ${tenantName}</li>
          <li><strong>Customer:</strong> ${customerName}</li>
          <li><strong>Amount:</strong> GHS ${formattedAmount}</li>
          <li><strong>Disbursed To:</strong> ${targetPhone} (${targetMethod})</li>
          <li><strong>Reference:</strong> ${reference}</li>
          <li><strong>Remaining Customer Balance:</strong> GHS ${formattedBalance}</li>
        </ul>
      `;
    }
    else if (job.name === 'withdrawal-rejected') {
      const reason = job.data.rejectionReason || 'Details not provided';

      customerSms = `Hello ${customerUser.firstName}, your withdrawal request of GHS ${formattedAmount} was rejected by ${tenantName}. Reason: ${reason}. Tx Ref: ${reference}.`;
      customerEmailSubject = `Withdrawal Request Rejected - ${tenantName}`;
      customerEmailHtml = `
        <h3>Withdrawal Request Declined</h3>
        <p>Hello ${customerUser.firstName},</p>
        <p>Your withdrawal request for <strong>GHS ${formattedAmount}</strong> was declined by ${tenantName}.</p>
        <p><strong>Reason for rejection:</strong> ${reason}</p>
        <p>Your funds have been returned to your savings wallet. Current wallet balance: GHS ${formattedBalance}.</p>
        <p><strong>Reference:</strong> ${reference}</p>
      `;
    }
    else if (job.name === 'withdrawal-completed') {
      customerSms = `Hello ${customerUser.firstName}, a withdrawal of GHS ${formattedAmount} has been successfully processed from your wallet by ${tenantName}. Tx Ref: ${reference}. Current Balance: GHS ${formattedBalance}.`;
      customerEmailSubject = `Withdrawal Completed - ${tenantName}`;
      customerEmailHtml = `
        <h3>Withdrawal Transaction Processed</h3>
        <p>Hello ${customerUser.firstName},</p>
        <p>A withdrawal of <strong>GHS ${formattedAmount}</strong> has been successfully processed from your wallet by ${tenantName}.</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p><strong>Current Wallet Balance:</strong> GHS ${formattedBalance}</p>
      `;

      adminEmailSubject = `Withdrawal Completed - ${tenantName}`;
      adminEmailHtml = `
        <h3>Withdrawal Logged</h3>
        <p>A new cash withdrawal has been processed for a customer.</p>
        <ul>
          <li><strong>Organization:</strong> ${tenantName}</li>
          <li><strong>Customer:</strong> ${customerName}</li>
          <li><strong>Amount:</strong> GHS ${formattedAmount}</li>
          <li><strong>Reference:</strong> ${reference}</li>
          <li><strong>Remaining Customer Balance:</strong> GHS ${formattedBalance}</li>
        </ul>
      `;
    }

    if (customerSms && phone) {
      await sendSMS(phone, customerSms, tenantId);
    }
    if (customerEmailHtml && email) {
      await sendEmail(email, customerEmailSubject, customerEmailHtml);
    }

    if (adminEmailHtml) {
      const admins = await db.user.findMany({
        where: {
          tenantId: transaction.tenantId,
          userRoles: {
            some: {
              role: {
                name: {
                  in: ['company_admin', 'account_officer'],
                },
              },
            },
          },
          status: 'active',
        },
      });

      for (const admin of admins) {
        if (admin.email) {
          await sendEmail(admin.email, adminEmailSubject, adminEmailHtml);
        }
      }
    }

    return { sent: true, event: job.name };
  },
  { connection },
);

const receiptWorker = new Worker(
  'receipts',
  async (job) => {
    console.log(`[receipts] Generating receipt for job ${job.id}:`, job.data);
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
