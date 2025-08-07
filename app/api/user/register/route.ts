import { NextRequest, NextResponse } from "next/server";

// This endpoint is deprecated - user registration is now handled by /api/auth/register
export async function POST(req: NextRequest) {
    return NextResponse.json(
        {
            error: "This endpoint is deprecated. Use /api/auth/register instead.",
            redirect: "/api/auth/register",
        },
        { status: 410 } // Gone
    );
}
