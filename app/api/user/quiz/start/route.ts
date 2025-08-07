import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function POST(req: NextRequest) {
    try {
        const { userId: clerkId } = await auth();
        const { quizId } = await req.json();

        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!quizId) {
            return NextResponse.json(
                { error: "Quiz ID is required" },
                { status: 400 }
            );
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Verify quiz exists and is active
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId, isActive: true },
        });

        if (!quiz) {
            return NextResponse.json(
                { error: "Quiz not found or inactive" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Quiz started successfully",
            quizId,
            startTime: new Date(),
        });
    } catch (error) {
        console.error("Error starting quiz:", error);
        return NextResponse.json(
            { error: "There was an error starting the quiz" },
            { status: 500 }
        );
    }
}
