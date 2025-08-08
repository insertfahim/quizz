import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { getCurrentUser } from "@/utils/auth";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser(req);
        const { quizId } = await req.json();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Only students can start quizzes (assignment requirement removed)
        if (user.role !== "student") {
            return NextResponse.json(
                { error: "Only students are allowed to start quizzes" },
                { status: 403 }
            );
        }

        if (!quizId) {
            return NextResponse.json(
                { error: "Quiz ID is required" },
                { status: 400 }
            );
        }

        // Verify quiz exists and is active
        const quiz = await prisma.quiz.findFirst({
            where: { id: quizId, isActive: true },
        });

        if (!quiz) {
            return NextResponse.json(
                { error: "Quiz not found or inactive" },
                { status: 404 }
            );
        }

        // Assignment linkage removed; simply acknowledge the start

        return NextResponse.json({ message: "Quiz started", quizId });
    } catch (error) {
        console.error("Error starting quiz:", error);
        return NextResponse.json(
            { error: "There was an error starting the quiz" },
            { status: 500 }
        );
    }
}
