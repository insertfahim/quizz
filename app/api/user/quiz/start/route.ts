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

        // Only students can start quizzes
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

        // Require an active assignment for this student
        const assignment = await prisma.quizAssignment.findFirst({
            where: {
                quizId,
                studentId: user.id,
                status: { in: ["assigned", "in_progress"] },
            },
        });

        if (!assignment) {
            return NextResponse.json(
                { error: "No assignment found for this quiz" },
                { status: 403 }
            );
        }

        // Mark assignment as in_progress and set startedAt if not set
        await prisma.quizAssignment.update({
            where: { id: assignment.id },
            data: {
                status: "in_progress",
                startedAt: assignment.startedAt ?? new Date(),
            },
        });

        return NextResponse.json({
            message: "Quiz started successfully",
            quizId,
            startTime: new Date(),
            user: { id: user.id, name: user.name },
        });
    } catch (error) {
        console.error("Error starting quiz:", error);
        return NextResponse.json(
            { error: "There was an error starting the quiz" },
            { status: 500 }
        );
    }
}
