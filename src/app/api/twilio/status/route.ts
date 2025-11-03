import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Twilio status callback handler
 * Receives status updates for outbound calls and records them.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    // Twilio sends application/x-www-form-urlencoded by default
    const params = Object.fromEntries(new URLSearchParams(body));

    const twilioSid = params['CallSid'] as string | undefined;
    const callStatus = params['CallStatus'] as string | undefined;
    const to = params['To'] as string | undefined;

    if (!twilioSid) {
      return NextResponse.json({ ok: false, message: 'missing CallSid' }, { status: 400 });
    }

    // Find matching call by Twilio SID or by targetNumber
    const call = await prisma.call.findFirst({ where: { twilioCallSid: twilioSid } });

    if (call) {
      await prisma.call.update({ where: { id: call.id }, data: { status: (callStatus || '').toUpperCase() } });
      await prisma.callLog.create({ data: { callId: call.id, eventType: 'twilio_status', metadata: params } });
    } else {
      // Try to match by target number if no twilio SID yet
      if (to) {
        const normalized = to.replace(/[^\d]/g, '');
        const maybe = await prisma.call.findFirst({ where: { targetNumber: { equals: normalized } }, orderBy: { createdAt: 'desc' } });
        if (maybe) {
          await prisma.call.update({ where: { id: maybe.id }, data: { twilioCallSid: twilioSid, status: (callStatus || '').toUpperCase() } });
          await prisma.callLog.create({ data: { callId: maybe.id, eventType: 'twilio_status', metadata: params } });
        }
      }
    }

    // Twilio expects a 2xx response quickly
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error handling Twilio status callback', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
