import { config } from 'dotenv';
import { resolve } from 'path';
import { Worker } from 'bullmq';
import { getRedisConnectionOptions } from '@susuflow/shared';
import { db } from '@susuflow/database';

config({ path: resolve(__dirname, '../../../.env') });

const connection = getRedisConnectionOptions();

console.log('SusuFlow worker starting...');

async function sendSMS(to: string, message: string, tenantId: string) {
  const provider = process.env.SMS_PROVIDER || 'hubtel';
  const isMock = provider === 'twilio'
    ? (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN)
    : !process.env.SMS_API_KEY;

  const cleanPhone = to.startsWith('0') ? '+233' + to.slice(1) : to;

  if (isMock) {
    console.log(`[SMS MOCK] To: ${cleanPhone} | Message: "${message}"`);
    return { success: true, provider: 'mock' };
  }

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
  const isMock = !process.env.SENDGRID_API_KEY;

  if (isMock) {
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

function generateSaaSEmailHtml({
  title,
  preheader,
  greeting,
  message,
  details,
  buttonLink,
  buttonText,
  tenantName,
  primaryColor = '#16A34A',
}: {
  title: string;
  preheader: string;
  greeting: string;
  message: string;
  details: { label: string; value: string }[];
  buttonLink?: string;
  buttonText?: string;
  tenantName: string;
  primaryColor?: string;
}) {
  const webUrl = process.env.WEB_URL || 'http://localhost:3000';
  const logoUrl = 'https://raw.githubusercontent.com/Gideon-Dadey/SusuFlow/main/apps/web/public/brand/logo-transparent.webp';

  const detailsHtml = details.map(d => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 14px; text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${d.label}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600; font-size: 14px; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${d.value}</td>
    </tr>
  `).join('');

  const buttonHtml = buttonLink && buttonText ? `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px; margin-bottom: 10px;">
      <tr>
        <td align="center">
          <a href="${buttonLink}" target="_blank" style="background-color: ${primaryColor}; color: #ffffff; padding: 12px 24px; font-weight: 600; text-decoration: none; display: inline-block; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${buttonText}</a>
        </td>
      </tr>
    </table>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
  <span style="display: none; max-height: 0px; overflow: hidden;">${preheader}</span>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 570px; background-color: #ffffff; border: 1px solid #f1f5f9; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
          <!-- Brand Header -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 30px 40px; text-align: left;">
              <table border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding-right: 12px; vertical-align: middle;">
                    <img src="${logoUrl}" alt="SusuFlow Logo" width="36" height="36" style="display: block; border: 0; outline: none; text-decoration: none;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1;">Susu<span style="color: #dcfce7;">Flow</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content Body -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${title}</h2>
              <p style="margin: 0 0 10px 0; font-size: 15px; color: #0f172a; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${greeting},</p>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #475569; line-height: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${message}</p>
              
              <!-- Details Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 15px 20px; border: 1px solid #f1f5f9;">
                ${detailsHtml}
              </table>
              
              ${buttonHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 25px 40px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                This transaction alert was sent to you on behalf of <strong>${tenantName}</strong>.
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #cbd5e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                Accra, Ghana • If you have questions, please contact your account manager.
              </p>
            </td>
          </tr>
        </table>
        <!-- Platform Branding -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 570px; margin-top: 20px; text-align: center;">
          <tr>
            <td style="font-size: 11px; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              Powered by <a href="https://susuflow.com" target="_blank" style="color: #64748b; text-decoration: underline; font-weight: 600;">SusuFlow</a> — Secure multi-tenant digital savings platform.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
    const primaryColor = '#16A34A'; // Standardize to App Primary Green Color
    const amount = Number(transaction.amount);
    const reference = transaction.reference;
    const phone = customerUser.phone;
    const email = customerUser.email;
    const webUrl = process.env.WEB_URL || 'http://localhost:3000';

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
      customerEmailHtml = generateSaaSEmailHtml({
        title: 'Deposit Confirmed',
        preheader: `Your deposit of GHS ${formattedAmount} has been credited.`,
        greeting: `Hello ${customerUser.firstName}`,
        message: `We've successfully credited your wallet with your latest deposit. Thank you for saving with us!`,
        details: [
          { label: 'Susu Company', value: tenantName },
          { label: 'Amount Deposited', value: `GHS ${formattedAmount}` },
          { label: 'Transaction Reference', value: reference },
          { label: 'Current Wallet Balance', value: `GHS ${formattedBalance}` },
          { label: 'Status', value: 'Completed' },
        ],
        buttonText: 'View Dashboard',
        buttonLink: `${webUrl}/dashboard`,
        tenantName,
        primaryColor,
      });

      adminEmailSubject = `New Confirmed Deposit - ${tenantName}`;
      adminEmailHtml = generateSaaSEmailHtml({
        title: 'New Confirmed Deposit',
        preheader: `A deposit of GHS ${formattedAmount} has been confirmed.`,
        greeting: 'Hello Administrator',
        message: `A new customer deposit transaction has been successfully processed on the platform.`,
        details: [
          { label: 'Susu Company', value: tenantName },
          { label: 'Customer Name', value: customerName },
          { label: 'Customer Email', value: customerUser.email || 'N/A' },
          { label: 'Amount Deposited', value: `GHS ${formattedAmount}` },
          { label: 'Transaction Reference', value: reference },
          { label: 'Updated Wallet Balance', value: `GHS ${formattedBalance}` },
        ],
        buttonText: 'View Admin Portal',
        buttonLink: `${webUrl}/admin`,
        tenantName,
        primaryColor,
      });
    } 
    else if (job.name === 'withdrawal-requested') {
      const wd = transaction.withdrawal;
      const targetPhone = wd?.disbursementPhone || phone || 'N/A';
      const targetMethod = wd?.disbursementMethod || 'Momo';

      customerSms = `Hello ${customerUser.firstName}, your withdrawal request of GHS ${formattedAmount} has been received and is pending review by ${tenantName}. Tx Ref: ${reference}.`;
      customerEmailSubject = `Withdrawal Request Received - ${tenantName}`;
      customerEmailHtml = generateSaaSEmailHtml({
        title: 'Withdrawal Request Pending',
        preheader: `Your request to withdraw GHS ${formattedAmount} is being reviewed.`,
        greeting: `Hello ${customerUser.firstName}`,
        message: `We have received your withdrawal request. It is currently undergoing administrative review and will be processed shortly.`,
        details: [
          { label: 'Susu Company', value: tenantName },
          { label: 'Requested Amount', value: `GHS ${formattedAmount}` },
          { label: 'Disbursement Target', value: targetPhone },
          { label: 'Disbursement Method', value: targetMethod },
          { label: 'Transaction Reference', value: reference },
          { label: 'Status', value: 'Pending Review' },
        ],
        buttonText: 'View Dashboard',
        buttonLink: `${webUrl}/dashboard`,
        tenantName,
        primaryColor,
      });

      adminEmailSubject = `Action Required: New Withdrawal Request - ${tenantName}`;
      adminEmailHtml = generateSaaSEmailHtml({
        title: 'Withdrawal Request Approval Required',
        preheader: `A new withdrawal request of GHS ${formattedAmount} needs review.`,
        greeting: 'Hello Administrator',
        message: `A customer has submitted a new withdrawal request that requires your administrative review and approval.`,
        details: [
          { label: 'Susu Company', value: tenantName },
          { label: 'Customer Name', value: customerName },
          { label: 'Customer Email', value: customerUser.email || 'N/A' },
          { label: 'Requested Amount', value: `GHS ${formattedAmount}` },
          { label: 'Disbursement Target', value: targetPhone },
          { label: 'Disbursement Method', value: targetMethod },
          { label: 'Transaction Reference', value: reference },
        ],
        buttonText: 'Review Request',
        buttonLink: `${webUrl}/admin/withdrawals`,
        tenantName,
        primaryColor,
      });
    }
    else if (job.name === 'withdrawal-approved') {
      const wd = transaction.withdrawal;
      const targetPhone = wd?.disbursementPhone || phone || 'N/A';
      const targetMethod = wd?.disbursementMethod || 'Momo';

      customerSms = `Hello ${customerUser.firstName}, your withdrawal request of GHS ${formattedAmount} has been APPROVED by ${tenantName}! Funds are being sent to ${targetPhone} via ${targetMethod}. Tx Ref: ${reference}.`;
      customerEmailSubject = `Withdrawal Approved - ${tenantName}`;
      customerEmailHtml = generateSaaSEmailHtml({
        title: 'Withdrawal Request Approved',
        preheader: `Your withdrawal of GHS ${formattedAmount} was approved.`,
        greeting: `Hello ${customerUser.firstName}`,
        message: `Great news! Your request to withdraw funds has been approved. The funds are currently being transferred to your disbursement account.`,
        details: [
          { label: 'Susu Company', value: tenantName },
          { label: 'Withdrawn Amount', value: `GHS ${formattedAmount}` },
          { label: 'Disbursement Target', value: targetPhone },
          { label: 'Disbursement Method', value: targetMethod },
          { label: 'Transaction Reference', value: reference },
          { label: 'New Wallet Balance', value: `GHS ${formattedBalance}` },
          { label: 'Status', value: 'Approved & Processing' },
        ],
        buttonText: 'View Dashboard',
        buttonLink: `${webUrl}/dashboard`,
        tenantName,
        primaryColor,
      });

      adminEmailSubject = `Withdrawal Approved & Disbursed - ${tenantName}`;
      adminEmailHtml = generateSaaSEmailHtml({
        title: 'Withdrawal Approved & Processed',
        preheader: `A withdrawal of GHS ${formattedAmount} was approved.`,
        greeting: 'Hello Administrator',
        message: `A customer withdrawal request has been approved and successfully marked for disbursement.`,
        details: [
          { label: 'Susu Company', value: tenantName },
          { label: 'Customer Name', value: customerName },
          { label: 'Withdrawn Amount', value: `GHS ${formattedAmount}` },
          { label: 'Disbursed To', value: targetPhone },
          { label: 'Disbursement Method', value: targetMethod },
          { label: 'Transaction Reference', value: reference },
          { label: 'Remaining Customer Balance', value: `GHS ${formattedBalance}` },
        ],
        buttonText: 'View Admin Portal',
        buttonLink: `${webUrl}/admin`,
        tenantName,
        primaryColor,
      });
    }
    else if (job.name === 'withdrawal-rejected') {
      const reason = job.data.rejectionReason || 'Details not provided';

      customerSms = `Hello ${customerUser.firstName}, your withdrawal request of GHS ${formattedAmount} was rejected by ${tenantName}. Reason: ${reason}. Tx Ref: ${reference}.`;
      customerEmailSubject = `Withdrawal Request Rejected - ${tenantName}`;
      customerEmailHtml = generateSaaSEmailHtml({
        title: 'Withdrawal Request Declined',
        preheader: `Your withdrawal of GHS ${formattedAmount} was declined.`,
        greeting: `Hello ${customerUser.firstName}`,
        message: `Your recent withdrawal request was declined. The requested funds have been safely returned to your savings wallet.`,
        details: [
          { label: 'Susu Company', value: tenantName },
          { label: 'Declined Amount', value: `GHS ${formattedAmount}` },
          { label: 'Reason for Rejection', value: reason },
          { label: 'Transaction Reference', value: reference },
          { label: 'Restored Wallet Balance', value: `GHS ${formattedBalance}` },
          { label: 'Status', value: 'Declined' },
        ],
        buttonText: 'View Dashboard',
        buttonLink: `${webUrl}/dashboard`,
        tenantName,
        primaryColor,
      });
    }
    else if (job.name === 'withdrawal-completed') {
      customerSms = `Hello ${customerUser.firstName}, a withdrawal of GHS ${formattedAmount} has been successfully processed from your wallet by ${tenantName}. Tx Ref: ${reference}. Current Balance: GHS ${formattedBalance}.`;
      customerEmailSubject = `Withdrawal Completed - ${tenantName}`;
      customerEmailHtml = generateSaaSEmailHtml({
        title: 'Withdrawal Completed',
        preheader: `Your withdrawal of GHS ${formattedAmount} has been processed.`,
        greeting: `Hello ${customerUser.firstName}`,
        message: `Your withdrawal has been successfully processed and deducted from your savings wallet.`,
        details: [
          { label: 'Susu Company', value: tenantName },
          { label: 'Withdrawn Amount', value: `GHS ${formattedAmount}` },
          { label: 'Transaction Reference', value: reference },
          { label: 'Current Wallet Balance', value: `GHS ${formattedBalance}` },
          { label: 'Status', value: 'Completed' },
        ],
        buttonText: 'View Dashboard',
        buttonLink: `${webUrl}/dashboard`,
        tenantName,
        primaryColor,
      });

      adminEmailSubject = `Withdrawal Completed - ${tenantName}`;
      adminEmailHtml = generateSaaSEmailHtml({
        title: 'Withdrawal Processed',
        preheader: `A withdrawal of GHS ${formattedAmount} was completed.`,
        greeting: 'Hello Administrator',
        message: `A new cash withdrawal transaction has been completed and registered on the ledger.`,
        details: [
          { label: 'Susu Company', value: tenantName },
          { label: 'Customer Name', value: customerName },
          { label: 'Withdrawn Amount', value: `GHS ${formattedAmount}` },
          { label: 'Transaction Reference', value: reference },
          { label: 'Remaining Customer Balance', value: `GHS ${formattedBalance}` },
        ],
        buttonText: 'View Admin Portal',
        buttonLink: `${webUrl}/admin`,
        tenantName,
        primaryColor,
      });
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
