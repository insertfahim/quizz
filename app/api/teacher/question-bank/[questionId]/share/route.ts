import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/connect";

// PATCH toggle share status
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ questionId: string }> }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user || user.role !== "teacher") {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        const { questionId } = await params;
        const body = await req.json();
        const { isShared } = body;

        const question = await prisma.questionBank.update({
            where: {
                id: questionId,
                creatorId: user.id, // Only owner can change share status
            },
            data: {
                isShared,
            },
        });

        return NextResponse.json(question);
    } catch (error) {
        console.error("Error updating share status:", error);
        return NextResponse.json(
            { error: "Failed to update share status" },
            { status: 500 }
        );
    }
}
