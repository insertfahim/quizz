import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET(req: NextRequest) {
    try {
        // Get all active quizzes with questions
        const quizzes = await prisma.quiz.findMany({
            where: { isActive: true },
            include: {
                questions: {
                    select: {
                        id: true,
                        text: true,
                        difficulty: true,
                        explanation: true,
                        options: {
                            select: {
                                id: true,
                                text: true,
                                isCorrect: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        questions: true,
                        submissions: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(quizzes);
    } catch (error) {
        console.log("There was an error getting quizzes: ", error);
        return NextResponse.json(
            { error: "There was an error getting quizzes" },
            {
                status: 500,
            }
        );
    }
}
