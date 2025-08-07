import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const timeFilter = searchParams.get("timeFilter") || "all";

        // Build date filter
        let dateFilter = {};
        const now = new Date();

        switch (timeFilter) {
            case "today":
                dateFilter = {
                    submittedAt: {
                        gte: new Date(now.setHours(0, 0, 0, 0)),
                    },
                };
                break;
            case "week":
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                dateFilter = {
                    submittedAt: {
                        gte: weekAgo,
                    },
                };
                break;
            case "month":
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                dateFilter = {
                    submittedAt: {
                        gte: monthAgo,
                    },
                };
                break;
        }

        // Get user scores with filters
        const submissions = await prisma.quizSubmission.findMany({
            where: {
                ...dateFilter,
            },
            include: {
                user: {
                    select: {
                        id: true,
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
        });

        // Calculate leaderboard
        const userScores = new Map();

        submissions.forEach((submission) => {
            const userId = submission.user.id;

            if (!userScores.has(userId)) {
                userScores.set(userId, {
                    userId,
                    name: submission.user.name,
                    email: submission.user.email,
                    totalScore: 0,
                    quizzesCompleted: 0,
                    scores: [],
                });
            }

            const userData = userScores.get(userId);
            userData.totalScore += submission.score;
            userData.quizzesCompleted += 1;
            userData.scores.push(submission.score);
        });

        // Convert to array and calculate averages
        const leaderboardData = Array.from(userScores.values()).map((user) => ({
            ...user,
            averageScore: user.totalScore / user.quizzesCompleted,
        }));

        // Sort by average score (descending)
        leaderboardData.sort((a, b) => b.averageScore - a.averageScore);

        // Add ranks
        const leaderboard = leaderboardData.map((user, index) => ({
            ...user,
            rank: index + 1,
        }));

        return NextResponse.json({
            leaderboard,
        });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json(
            { error: "Failed to fetch leaderboard" },
            { status: 500 }
        );
    }
}
