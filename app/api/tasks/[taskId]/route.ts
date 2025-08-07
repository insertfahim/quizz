import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/auth";
import prisma from "@/utils/connect";

// PUT update a task
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const user = await getCurrentUser(req);

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { taskId } = await params;
        const body = await req.json();
        const { title, description, category, priority, dueDate } = body;

        const task = await prisma.task.update({
            where: {
                id: taskId,
                userId: user.id,
            },
            data: {
                title,
                description,
                category,
                priority,
                dueDate: dueDate ? new Date(dueDate) : null,
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json(
            { error: "Failed to update task" },
            { status: 500 }
        );
    }
}

// DELETE a task
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const user = await getCurrentUser(req);

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { taskId } = await params;
        await prisma.task.delete({
            where: {
                id: taskId,
                userId: user.id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting task:", error);
        return NextResponse.json(
            { error: "Failed to delete task" },
            { status: 500 }
        );
    }
}
