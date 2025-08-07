import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/connect";

// GET all tasks for the current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST create a new task
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, category, priority, dueDate } = body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        category,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: user.id,
      },
    });

    // Create notification for task with due date
    if (dueDate) {
      await prisma.notification.create({
        data: {
          type: "task_reminder",
          title: "Task Due Soon",
          message: `Your task "${title}" is due on ${new Date(dueDate).toLocaleDateString()}`,
          userId: user.id,
          relatedTaskId: task.id,
        },
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
