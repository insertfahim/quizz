import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/connect";

// PATCH update task status
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
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

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const { taskId } = await params;
        const body = await req.json();
        const { status } = body;

        const updateData: any = { status };

        // If marking as completed, set completedAt
        if (status === "completed") {
            updateData.completedAt = new Date();
        } else if (status !== "completed") {
            updateData.completedAt = null;
        }

        const task = await prisma.task.update({
            where: {
                id: taskId,
                userId: user.id,
            },
            data: updateData,
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("Error updating task status:", error);
        return NextResponse.json(
            { error: "Failed to update task status" },
            { status: 500 }
        );
    }
}
