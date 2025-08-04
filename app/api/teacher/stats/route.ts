import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireTeacher } from "@/utils/roles";

// GET /api/teacher/stats - Get teacher dashboard statistics
export async function GET(req: NextRequest) {
    try {
        const teacher = await requireTeacher();

        // Get all quizzes created by the teacher
        const teacherQuizzes = await prisma.quiz.findMany({
            where: { creatorId: teacher.id },
            select: { id: true },
        });

        const quizIds = teacherQuizzes.map(quiz => quiz.id);

        // Get comprehensive statistics
        const [
            totalQuizzes,
            activeQuizzes,
            totalSubmissions,
            totalStudents,
            categoryStats,
            recentSubmissions,
            averageScores
        ] = await Promise.all([
            // Total quizzes created
            prisma.quiz.count({
                where: { creatorId: teacher.id },
            }),

            // Active quizzes
            prisma.quiz.count({
                where: { 
                    creatorId: teacher.id,
                    isActive: true 
                },
            }),

            // Total submissions across all teacher's quizzes
            prisma.quizSubmission.count({
                where: { quizId: { in: quizIds } },
            }),

            // Unique students who attempted teacher's quizzes
            prisma.quizSubmission.findMany({
                where: { quizId: { in: quizIds } },
                select: { userId: true },
                distinct: ['userId'],
            }).then(submissions => submissions.length),

            // Quiz statistics by category
            prisma.quiz.groupBy({
                by: ['categoryId'],
                where: { creatorId: teacher.id },
                _count: {
                    id: true,
                },
                _avg: {
                    timeLimit: true,
                },
            }),

            // Recent submissions (last 10)
            prisma.quizSubmission.findMany({
                where: { quizId: { in: quizIds } },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                    quiz: {
                        select: {
                            title: true,
                        },
                    },
                },
                orderBy: {
                    submittedAt: 'desc',
                },
                take: 10,
            }),

            // Average scores by quiz
            prisma.quizSubmission.groupBy({
                by: ['quizId'],
                where: { quizId: { in: quizIds } },
                _avg: {
                    score: true,
                },
                _count: {
                    id: true,
                },
            }),
        ]);

        // Get category names for category stats
        const categoriesWithNames = await Promise.all(
            categoryStats.map(async (stat) => {
                const category = await prisma.category.findUnique({
                    where: { id: stat.categoryId },
                    select: { name: true },
                });
                return {
                    ...stat,
                    categoryName: category?.name || 'Unknown',
                };
            })
        );

        // Get quiz names for average scores
        const averageScoresWithNames = await Promise.all(
            averageScores.map(async (score) => {
                const quiz = await prisma.quiz.findUnique({
                    where: { id: score.quizId },
                    select: { title: true },
                });
                return {
                    ...score,
                    quizTitle: quiz?.title || 'Unknown',
                };
            })
        );

        const stats = {
            overview: {
                totalQuizzes,
                activeQuizzes,
                totalSubmissions,
                totalStudents,
            },
            categoryBreakdown: categoriesWithNames,
            recentSubmissions,
            averageScores: averageScoresWithNames,
        };

        return NextResponse.json(stats);
    } catch (error: any) {
        console.error("Error fetching teacher stats:", error);
        return NextResponse.json(
            { error: error.message || "Error fetching statistics" },
            { status: error.message === "Teacher role required" ? 403 : 500 }
        );
    }
}