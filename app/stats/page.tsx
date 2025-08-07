import { auth } from "@clerk/nextjs/server";
import React from "react";
import prisma from "@/utils/connect";
import UserStats from "@/components/UserStats";

async function page() {
    let userId = null;
    try {
        const authResult = await auth();
        userId = authResult.userId;
    } catch (error) {
        console.log("Auth not available, showing guest stats");
    }

    if (!userId) {
        return (
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 text-center">
                <h1 className="text-2xl">Please sign in to view your stats</h1>
                <p className="mt-2 text-gray-600">
                    Sign in to track your quiz progress and performance
                </p>
            </div>
        );
    }

    // Get user data with quiz submissions
    const user = await prisma.user.findUnique({
        where: {
            clerkId: userId,
        },
        include: {
            submissions: {
                include: {
                    quiz: {
                        select: {
                            title: true,
                        },
                    },
                },
                orderBy: {
                    submittedAt: "desc",
                },
            },
        },
    });

    console.log("User stats:", user);

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <UserStats userStats={user} />
        </div>
    );
}

export default page;
