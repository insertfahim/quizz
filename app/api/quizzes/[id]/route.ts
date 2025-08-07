import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const quiz = await prisma.quiz.findUnique({
            where: { id },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        questions: true,
                        submissions: true,
                    },
                },
            },
        });

        if (!quiz) {
            return NextResponse.json(
                { error: "Quiz not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error("Error fetching quiz:", error);
        return NextResponse.json(
            { error: "Failed to fetch quiz" },
            { status: 500 }
        );
    }
}
