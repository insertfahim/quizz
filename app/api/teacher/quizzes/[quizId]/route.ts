import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireTeacher } from "@/utils/auth";

// GET /api/teacher/quizzes/[quizId] - Get specific quiz with detailed information
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ quizId: string }> }
) {
    try {
        await requireTeacher(req);
        const { quizId } = await params;

        // Teachers and admins can manage any quiz (simplified check)
        // TODO: Add proper quiz ownership validation if needed

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                creator: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                questions: {
                    include: {
                        options: true,
                    },
                    orderBy: {
                        id: "asc",
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
                        answers: {
                            include: {
                                question: {
                                    select: {
                                        text: true,
                                    },
                                },
                                selectedOption: {
                                    select: {
                                        text: true,
                                        isCorrect: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        submittedAt: "desc",
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
    } catch (error: any) {
        console.error("Error fetching quiz:", error);
        return NextResponse.json(
            { error: error.message || "Error fetching quiz" },
            { status: error.message?.includes("required") ? 403 : 500 }
        );
    }
}

// PUT /api/teacher/quizzes/[quizId] - Update quiz
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ quizId: string }> }
) {
    try {
        await requireTeacher(req);
        const { quizId } = await params;

        // Teachers and admins can manage any quiz (simplified check)
        // TODO: Add proper quiz ownership validation if needed

        const { title, description, timeLimit, isActive } = await req.json();

        const updatedQuiz = await prisma.quiz.update({
            where: { id: quizId },
            data: {
                title,
                description,
                timeLimit,
                isActive,
                updatedAt: new Date(),
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
                        submissions: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedQuiz);
    } catch (error: any) {
        console.error("Error updating quiz:", error);
        return NextResponse.json(
            { error: error.message || "Error updating quiz" },
            { status: error.message?.includes("required") ? 403 : 500 }
        );
    }
}

// DELETE /api/teacher/quizzes/[quizId] - Delete quiz
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ quizId: string }> }
) {
    try {
        await requireTeacher(req);
        const { quizId } = await params;

        // Teachers and admins can manage any quiz (simplified check)
        // TODO: Add proper quiz ownership validation if needed

        // Check if quiz has submissions
        const submissionCount = await prisma.quizSubmission.count({
            where: { quizId },
        });

        if (submissionCount > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete quiz with existing submissions. Deactivate instead.",
                },
                { status: 400 }
            );
        }

        await prisma.quiz.delete({
            where: { id: quizId },
        });

        return NextResponse.json({ message: "Quiz deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting quiz:", error);
        return NextResponse.json(
            { error: error.message || "Error deleting quiz" },
            { status: error.message?.includes("required") ? 403 : 500 }
        );
    }
}
