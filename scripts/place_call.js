/* One-off script to create a call record and place a Twilio outbound call.
   Usage: node scripts/place_call.js <targetNumber> [amdStrategy]
   targetNumber may be E.164 (+1415...) or digits (1415... or 415...).
   amdStrategy defaults to "twilio".

   This script reads .env.local for DATABASE_URL and TWILIO_* variables.
   It will create a test user if none exists and will not commit any secrets.
*/

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const Twilio = require('twilio');

const prisma = new PrismaClient();

async function normalizeNumber(input) {
  // If number starts with +, assume E.164 and return as-is
  if (!input) throw new Error('No target number provided');
  let n = input.trim();
  if (n.startsWith('+')) return n;
  // If starts with 1 and length 11, assume country code present
  if (/^1\d{10}$/.test(n)) return `+${n}`;
  // If 10 digits, assume US and prefix +1
  if (/^\d{10}$/.test(n)) return `+1${n}`;
  // Otherwise, return as-is (Twilio may reject)
  return n;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node scripts/place_call.js <targetNumber> [amdStrategy]');
    process.exit(2);
  }
  const targetRaw = args[0];
  const amdStrategy = args[1] || 'twilio';
  const target = await normalizeNumber(targetRaw);

  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_NUMBER = process.env.TWILIO_NUMBER || process.env.TWILIO_PHONE_NUMBER;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_NUMBER) {
    console.error('Twilio credentials not set in .env.local');
    process.exit(3);
  }

  // Find or create a test user
  let user = await prisma.user.findFirst({ where: { email: 'local-test@localhost' } });
  if (!user) {
    user = await prisma.user.create({ data: { email: 'local-test@localhost', name: 'Local Test' } });
    console.log('Created test user', user.id);
  }

  // Create call record
  const call = await prisma.call.create({
    data: {
      userId: user.id,
      targetNumber: target.replace('+', ''), // match app format (digits only)
      amdStrategy,
      status: 'PENDING',
    },
  });

  await prisma.callLog.create({
    data: {
      callId: call.id,
      eventType: 'call_initiated_script',
      metadata: { target: target, amdStrategy },
    },
  });

  console.log('Placing Twilio call to', target, 'for call id', call.id);

  const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  try {
    const statusCallback = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/api/twilio/status`;
    const twilioCall = await client.calls.create({
      to: target,
      from: TWILIO_NUMBER,
      statusCallback,
      statusCallbackEvent: ['initiated','ringing','answered','completed'],
    });

    await prisma.call.update({ where: { id: call.id }, data: { twilioCallSid: twilioCall.sid, status: 'RINGING' } });
    await prisma.callLog.create({ data: { callId: call.id, eventType: 'twilio_call_created', metadata: { sid: twilioCall.sid } } });

    console.log('Twilio call created, sid=', twilioCall.sid);
  } catch (err) {
    console.error('Twilio call failed:', err && err.message ? err.message : err);
    await prisma.callLog.create({ data: { callId: call.id, eventType: 'twilio_error', metadata: { error: String(err) } } });
    process.exit(4);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(async (e) => {
  console.error('Fatal error:', e);
  try { await prisma.$disconnect(); } catch {};
  process.exit(99);
});
