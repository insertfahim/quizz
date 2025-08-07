import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAdmin } from "@/utils/roles";

export async function GET(req: NextRequest) {
    try {
        await requireAdmin();

        const searchParams = req.nextUrl.searchParams;
        const period = searchParams.get("period") || "7d"; // 7d, 30d, 90d, 1y

        // Calculate date range based on period
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case "30d":
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case "90d":
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case "1y":
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default: // 7d
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        // Get comprehensive system statistics
        const [
            totalUsers,
            totalStudents,
            totalTeachers,
            totalAdmins,
            activeUsers,
            totalQuizzes,
            activeQuizzes,
            totalSubmissions,
            totalTasks,
            completedTasks,
            totalQuestions,
            recentUsers,
            recentSubmissions,
            usersByRole,
            submissionsByDay,
            popularQuizzes,
            userActivityStats,
        ] = await Promise.all([
            // Basic counts
            prisma.user.count(),
            prisma.user.count({ where: { role: "student" } }),
            prisma.user.count({ where: { role: "teacher" } }),
            prisma.user.count({ where: { role: "admin" } }),
            prisma.user.count({ where: { isActive: true } }),
            prisma.quiz.count(),
            prisma.quiz.count({ where: { isActive: true } }),
            prisma.quizSubmission.count(),
            prisma.task.count(),
            prisma.task.count({ where: { status: "completed" } }),
            prisma.question.count(),

            // Recent activity
            prisma.user.findMany({
                where: {
                    createdAt: { gte: startDate },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            }),

            prisma.quizSubmission.findMany({
                where: {
                    submittedAt: { gte: startDate },
                },
                orderBy: { submittedAt: "desc" },
                take: 10,
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
            }),

            // User distribution by role
            prisma.user.groupBy({
                by: ["role"],
                _count: {
                    id: true,
                },
            }),

            // Daily submissions for the period
            prisma.$queryRaw`
                SELECT 
                    DATE_TRUNC('day', "submittedAt") as date,
                    COUNT(*) as count
                FROM "QuizSubmission"
                WHERE "submittedAt" >= ${startDate}
                GROUP BY DATE_TRUNC('day', "submittedAt")
                ORDER BY date DESC
            `,

            // Popular quizzes
            prisma.quiz.findMany({
                orderBy: {
                    submissions: {
                        _count: "desc",
                    },
                },
                take: 10,
                select: {
                    id: true,
                    title: true,
                    creator: {
                        select: {
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            submissions: true,
                            questions: true,
                        },
                    },
                },
            }),

            // User activity statistics
            prisma.user.findMany({
                where: {
                    lastLoginAt: { gte: startDate },
                },
                select: {
                    id: true,
                    name: true,
                    role: true,
                    lastLoginAt: true,
                    _count: {
                        select: {
                            submissions: true,
                            createdQuizzes: true,
                            tasks: true,
                        },
                    },
                },
                orderBy: {
                    lastLoginAt: "desc",
                },
                take: 20,
            }),
        ]);

        // Calculate growth rates
        const previousPeriodStart = new Date(
            startDate.getTime() - (now.getTime() - startDate.getTime())
        );

        const [previousUsers, previousSubmissions] = await Promise.all([
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: previousPeriodStart,
                        lt: startDate,
                    },
                },
            }),
            prisma.quizSubmission.count({
                where: {
                    submittedAt: {
                        gte: previousPeriodStart,
                        lt: startDate,
                    },
                },
            }),
        ]);

        const currentPeriodUsers = await prisma.user.count({
            where: {
                createdAt: { gte: startDate },
            },
        });

        const currentPeriodSubmissions = await prisma.quizSubmission.count({
            where: {
                submittedAt: { gte: startDate },
            },
        });

        // Calculate average scores
        const avgScore = await prisma.quizSubmission.aggregate({
            _avg: {
                score: true,
            },
            where: {
                submittedAt: { gte: startDate },
            },
        });

        const stats = {
            overview: {
                totalUsers,
                totalStudents,
                totalTeachers,
                totalAdmins,
                activeUsers,
                totalQuizzes,
                activeQuizzes,
                totalSubmissions,
                totalTasks,
                completedTasks,
                totalQuestions,
                averageScore: avgScore._avg.score || 0,
            },
            growth: {
                userGrowth:
                    previousUsers === 0
                        ? 100
                        : ((currentPeriodUsers - previousUsers) /
                              previousUsers) *
                          100,
                submissionGrowth:
                    previousSubmissions === 0
                        ? 100
                        : ((currentPeriodSubmissions - previousSubmissions) /
                              previousSubmissions) *
                          100,
            },
            recentActivity: {
                recentUsers,
                recentSubmissions,
            },
            distribution: {
                usersByRole: usersByRole.map((item) => ({
                    role: item.role,
                    count: item._count.id,
                })),
                submissionsByDay,
            },
            popular: {
                quizzes: popularQuizzes,
            },
            userActivity: userActivityStats,
        };

        return NextResponse.json(stats);
    } catch (error: any) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch statistics" },
            { status: error.message === "Admin role required" ? 403 : 500 }
        );
    }
}
