import React from "react";
import prisma from "@/utils/connect";
import UserStats from "@/components/UserStats";
import { getCurrentUser } from "@/utils/auth";
import { cookies } from "next/headers";

async function page() {
    let user = null;
    try {
        // Create a mock request object with cookies for server-side auth
        const cookieStore = await cookies();
        const authToken = cookieStore.get("auth-token");

        if (authToken) {
            const mockRequest = {
                cookies: {
                    get: (name: string) => ({ value: authToken.value }),
                },
            } as any;
            user = await getCurrentUser(mockRequest);
        }
    } catch (error) {
        console.log("Auth not available, showing guest stats");
    }

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 text-center">
                <h1 className="text-2xl">Please sign in to view your stats</h1>
                <p className="mt-2 text-gray-600">
                    Sign in to track your quiz progress and performance
                </p>
            </div>
        );
    }

    // Get user data with quiz submissions - user is already fetched above
    const userWithSubmissions = await prisma.user.findUnique({
        where: {
            id: user.id,
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

    console.log("User stats:", userWithSubmissions);

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <UserStats userStats={userWithSubmissions} />
        </div>
    );
}

export default page;
