import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/connect";

// PUT update a question
export async function PUT(
  req: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { text, type, difficulty, explanation, category, isShared, options, correctAnswer } = body;

    const question = await prisma.questionBank.update({
      where: {
        id: params.questionId,
        creatorId: user.id, // Only owner can update
      },
      data: {
        text,
        type,
        difficulty,
        explanation,
        category,
        isShared,
        options: options ? JSON.stringify(options) : null,
        correctAnswer,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

// DELETE a question
export async function DELETE(
  req: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.questionBank.delete({
      where: {
        id: params.questionId,
        creatorId: user.id, // Only owner can delete
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
