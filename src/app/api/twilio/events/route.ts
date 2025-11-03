import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Generic Twilio events endpoint — placeholder for Media Stream events
 * Twilio Media Streams uses WebSocket; some events may be proxied here from other services.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    // Expect JSON payloads forwarded by an intermediary (or for non-stream events)
    if (!body) return NextResponse.json({ ok: false, message: 'no json body' }, { status: 400 });

    const { eventType, callSid, data } = body as { eventType?: string; callSid?: string; data?: any };

    if (!callSid) return NextResponse.json({ ok: false, message: 'missing callSid' }, { status: 400 });

    const call = await prisma.call.findFirst({ where: { twilioCallSid: callSid } });
    if (!call) return NextResponse.json({ ok: false, message: 'call not found' }, { status: 404 });

    await prisma.callLog.create({ data: { callId: call.id, eventType: eventType || 'twilio_event', metadata: data || body } });

    // If body contains an AMD decision, persist as AMDResult
    if (body.decision) {
      await prisma.aMDResult.create({ data: { callId: call.id, strategy: body.strategy || 'external', decision: body.decision, confidence: body.confidence ?? undefined, details: body.details ?? undefined } });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error handling twilio event:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
