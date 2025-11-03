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

    return NextResponse.json({
      callId: call.id,
      status: call.status,
      targetNumber: call.targetNumber,
      amdStrategy: call.amdStrategy,
      message: "Call initiated. Twilio integration pending.",
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
