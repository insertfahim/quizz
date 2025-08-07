import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireTeacher } from "@/utils/auth";

// GET /api/teacher/quizzes - Get all quizzes created by the teacher
export async function GET(req: NextRequest) {
    try {
        const teacher = await requireTeacher(req);

        const quizzes = await prisma.quiz.findMany({
            where: { creatorId: teacher.id },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
                submissions: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
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
    } catch (error: any) {
        console.error("Error fetching teacher quizzes:", error);
        return NextResponse.json(
            { error: error.message || "Error fetching quizzes" },
            { status: error.message === "Teacher role required" ? 403 : 500 }
        );
    }
}

// POST /api/teacher/quizzes - Create a new quiz
export async function POST(req: NextRequest) {
    try {
        const teacher = await requireTeacher(req);
        const { title, description, timeLimit, questions } = await req.json();

        // Validate required fields
        if (!title || !questions || questions.length === 0) {
            return NextResponse.json(
                { error: "Title and at least one question are required" },
                { status: 400 }
            );
        }

        // Create quiz with questions and options
        const quiz = await prisma.quiz.create({
            data: {
                title,
                description,
                timeLimit,
                creatorId: teacher.id,
                questions: {
                    create: questions.map((question: any) => ({
                        text: question.text,
                        type: question.type || "multiple_choice",
                        difficulty: question.difficulty,
                        explanation: question.explanation,
                        options: {
                            create: question.options || [],
                        },
                    })),
                },
            },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
                _count: {
                    select: {
                        questions: true,
                    },
                },
            },
        });

        return NextResponse.json(quiz, { status: 201 });
    } catch (error: any) {
        console.error("Error creating quiz:", error);
        return NextResponse.json(
            { error: error.message || "Error creating quiz" },
            { status: error.message === "Teacher role required" ? 403 : 500 }
        );
    }
}
