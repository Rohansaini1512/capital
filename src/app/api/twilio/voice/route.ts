/**
 * Twilio Voice Answer webhook
 * Returns minimal TwiML; Media Streams can be added later by providing a <Start><Stream/></Start> block.
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const callId = url.searchParams.get("callId") || "";

  const say = `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <Say voice="Polly.Matthew">Please hold while we connect your call.</Say>
  </Response>`;

  return new NextResponse(say, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export const dynamic = "force-dynamic";


