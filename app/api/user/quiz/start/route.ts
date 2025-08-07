import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function POST(req: NextRequest) {
    try {
        const { userId: clerkId } = await auth();
        const { categoryId } = await req.json();

        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!categoryId) {
            return NextResponse.json(
                { error: "Category ID is required" },
                { status: 400 }
            );
        }

        // Use transaction for atomic operations
        const stat = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { clerkId },
            });

            if (!user) {
                throw new Error("User not found");
            }

            const userId = user.id;

            // find or create a categoryStat entry
            let stat = await tx.categoryStat.findUnique({
                where: {
                    userId_categoryId: {
                        categoryId,
                        userId,
                    },
                },
            });

            if (!stat) {
                stat = await tx.categoryStat.create({
                    data: {
                        userId,
                        categoryId,
                        attempts: 1,
                        completed: 0,
                        lastAttempt: new Date(),
                    },
                });
            } else {
                stat = await tx.categoryStat.update({
                    where: {
                        userId_categoryId: {
                            userId,
                            categoryId,
                        },
                    },
                    data: {
                        attempts: stat.attempts + 1,
                        lastAttempt: new Date(),
                    },
                });
            }

            return stat;
        });

        return NextResponse.json(stat);
    } catch (error) {
        console.error("Error starting quiz: ", error);
        return NextResponse.json(
            { error: "Error starting quiz" },
            { status: 500 }
        );
    }
}
