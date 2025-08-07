import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAdmin } from "@/utils/auth";

export async function GET(req: NextRequest) {
    try {
        await requireAdmin(req);

        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || ""; // active, inactive, all
        const creatorId = searchParams.get("creatorId") || "";

        const skip = (page - 1) * limit;

        // Build where clause
        const whereClause: any = {};

        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        if (status === "active") {
            whereClause.isActive = true;
        } else if (status === "inactive") {
            whereClause.isActive = false;
        }

        if (creatorId) {
            whereClause.creatorId = creatorId;
        }

        // Get quizzes with pagination
        const [quizzes, totalCount] = await Promise.all([
            prisma.quiz.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    _count: {
                        select: {
                            questions: true,
                            submissions: true,
                        },
                    },
                },
            }),
            prisma.quiz.count({ where: whereClause }),
        ]);

        // Get quiz statistics
        const quizzesWithStats = await Promise.all(
            quizzes.map(async (quiz) => {
                const submissionStats = await prisma.quizSubmission.aggregate({
                    where: { quizId: quiz.id },
                    _avg: { score: true },
                    _min: { score: true },
                    _max: { score: true },
                });

                return {
                    ...quiz,
                    stats: {
                        averageScore: submissionStats._avg.score || 0,
                        minScore: submissionStats._min.score || 0,
                        maxScore: submissionStats._max.score || 0,
                    },
                };
            })
        );

        return NextResponse.json({
            quizzes: quizzesWithStats,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error: any) {
        console.error("Error fetching quizzes:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch quizzes" },
            { status: error.message === "Admin role required" ? 403 : 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const admin = await requireAdmin(req);
        const { quizId, isActive, title, description } = await req.json();

        if (!quizId) {
            return NextResponse.json(
                { error: "Quiz ID is required" },
                { status: 400 }
            );
        }

        // Get current quiz data for audit log
        const currentQuiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            select: {
                title: true,
                description: true,
                isActive: true,
                creator: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!currentQuiz) {
            return NextResponse.json(
                { error: "Quiz not found" },
                { status: 404 }
            );
        }

        // Update quiz
        const updatedQuiz = await prisma.quiz.update({
            where: { id: quizId },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(typeof isActive === "boolean" && { isActive }),
                updatedAt: new Date(),
            },
            include: {
                creator: {
                    select: {
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

        // Create audit log for significant changes
        const changes: any = {};
        if (
            typeof isActive === "boolean" &&
            isActive !== currentQuiz.isActive
        ) {
            changes.statusChanged = {
                from: currentQuiz.isActive,
                to: isActive,
            };
        }
        if (title && title !== currentQuiz.title) {
            changes.titleChanged = { from: currentQuiz.title, to: title };
        }

        if (Object.keys(changes).length > 0) {
            // TODO: Create audit log functionality if needed
            console.log(
                `Admin ${admin.email} updated quiz ${quizId}:`,
                changes
            );
        }

        return NextResponse.json(updatedQuiz);
    } catch (error: any) {
        console.error("Error updating quiz:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update quiz" },
            { status: error.message === "Admin role required" ? 403 : 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const admin = await requireAdmin(req);
        const { quizId } = await req.json();

        if (!quizId) {
            return NextResponse.json(
                { error: "Quiz ID is required" },
                { status: 400 }
            );
        }

        // Get quiz details for audit log
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                creator: {
                    select: {
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

        // Delete quiz (cascade deletes will handle related records)
        await prisma.quiz.delete({
            where: { id: quizId },
        });

        // TODO: Create audit log functionality if needed
        console.log(
            `Admin ${admin.email} deleted quiz "${quiz.title}" (ID: ${quizId})`
        );

        return NextResponse.json({ message: "Quiz deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting quiz:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete quiz" },
            { status: error.message === "Admin role required" ? 403 : 500 }
        );
    }
}
