import { NextResponse } from "next/server";

export async function GET() {
  // Check if Clerk environment variables are set
  const hasPublishableKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasSecretKey = !!process.env.CLERK_SECRET_KEY;
  
  return NextResponse.json({
    status: "ok",
    environment: {
      hasPublishableKey,
      hasSecretKey,
      nodeEnv: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  });
}
