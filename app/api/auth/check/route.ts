import { NextResponse } from "next/server";

export async function GET() {
    const hasJwtSecret = !!process.env.JWT_SECRET;
    return NextResponse.json({
        status: "ok",
        environment: {
            hasJwtSecret,
            nodeEnv: process.env.NODE_ENV,
        },
        timestamp: new Date().toISOString(),
    });
}
