/**
 * API Route: Call History
 * 
 * GET /api/calls/history
 * 
 * Retrieves paginated call history for the authenticated user.
 * Supports filtering by AMD strategy and call status.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { CallStatus } from "@/types/call";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const strategy = searchParams.get("strategy");
    const status = searchParams.get("status");

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (strategy && strategy !== "all") {
      where.amdStrategy = strategy;
    }

    if (status && status !== "all") {
      where.status = status as CallStatus;
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Fetch calls and total count
    const [calls, total] = await Promise.all([
      prisma.call.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          targetNumber: true,
          amdStrategy: true,
          status: true,
          twilioCallSid: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.call.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      calls,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching call history:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch call history",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
