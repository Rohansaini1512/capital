/**
 * API Route: Initiate Call
 * 
 * POST /api/calls/initiate
 * 
 * Initiates an outbound call to a target number using the specified AMD strategy.
 * Creates a call record in the database and returns call information.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { CallStatus } from "@/types/call";
import { z } from "zod";
import Twilio from "twilio";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const TWILIO_MEDIA_WS_URL = process.env.TWILIO_MEDIA_WS_URL; // optional external WS URL that Twilio will stream audio to

/**
 * Request body schema
 */
const initiateCallSchema = z.object({
  targetNumber: z.string().regex(/^\d{10,11}$/, "Invalid phone number format"),
  amdStrategy: z.enum(["gemini", "huggingface", "jambonz"]),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = initiateCallSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { targetNumber, amdStrategy } = validationResult.data;

    // Create call record in database
    // Note: Twilio integration will be added later, so we'll set status to PENDING
    const call = await prisma.call.create({
      data: {
        userId: user.id,
        targetNumber,
        amdStrategy,
        status: "PENDING" as CallStatus,
      },
    });

    // Create initial call log
    await prisma.callLog.create({
      data: {
        callId: call.id,
        eventType: "call_initiated",
        metadata: {
          targetNumber,
          amdStrategy,
          userId: user.id,
        },
      },
    });

    // TODO: Integrate with Twilio to actually place the call
    // For now, we'll return the call record with PENDING status

    // If Twilio creds are available, kick off an outbound call
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
      try {
        const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

        // Build parameters for the outbound call
        const statusCallback = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/twilio/status`;

        const twimlStart = TWILIO_MEDIA_WS_URL
          ? `<Response><Start><Stream url=\"${TWILIO_MEDIA_WS_URL}\"/></Start></Response>`
          : undefined;

        const callParams: Record<string, unknown> = {
          to: `+${targetNumber}`,
          from: TWILIO_PHONE_NUMBER,
          statusCallback,
          statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
          machineDetection: amdStrategy === "twilio" ? "Enable" : undefined,
        };

        if (twimlStart) callParams.twiml = twimlStart;

        const twilioCall = await client.calls.create(callParams);

        // update call record with Twilio SID and set status to RINGING
        await prisma.call.update({ where: { id: call.id }, data: { twilioCallSid: twilioCall.sid, status: "RINGING" } });

        await prisma.callLog.create({
          data: {
            callId: call.id,
            eventType: "twilio_call_created",
            metadata: { sid: twilioCall.sid, to: targetNumber, amdStrategy },
          },
        });

        return NextResponse.json({
          callId: call.id,
          status: "RINGING",
          targetNumber: call.targetNumber,
          amdStrategy: call.amdStrategy,
          twilioSid: twilioCall.sid,
        });
      } catch (err) {
        console.error("Twilio call creation failed:", err);
        // keep the DB call record; return an error but allow inspection
        return NextResponse.json({ error: "Failed to create Twilio call", details: String(err) }, { status: 502 });
      }
    }

    return NextResponse.json({
      callId: call.id,
      status: call.status,
      targetNumber: call.targetNumber,
      amdStrategy: call.amdStrategy,
      message: "Call record created locally. Set TWILIO_* env vars to place calls.",
    });
  } catch (error) {
    console.error("Error initiating call:", error);
    return NextResponse.json(
      {
        error: "Failed to initiate call",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
