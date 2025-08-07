import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/auth";

// This endpoint is deprecated - use /api/auth/me instead
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser(req);

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.log("Error getting user: ", error);
        return NextResponse.json(
            { error: "Error getting user" },
            { status: 500 }
        );
    }
}
