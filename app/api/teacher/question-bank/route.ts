import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/connect";

// GET all questions from the bank (own and shared)
export async function GET(req: NextRequest) {
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

    // Get own questions and shared questions from other teachers
    const questions = await prisma.questionBank.findMany({
      where: {
        OR: [
          { creatorId: user.id },
          { isShared: true }
        ]
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching question bank:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST create a new question in the bank
export async function POST(req: NextRequest) {
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

    const question = await prisma.questionBank.create({
      data: {
        text,
        type,
        difficulty,
        explanation,
        category,
        isShared,
        options: options ? JSON.stringify(options) : null,
        correctAnswer,
        creatorId: user.id,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
