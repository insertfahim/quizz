import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { getCurrentUser } from "@/utils/auth";

// GET: list assignments for current student
export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        if (user.role !== "student") {
            return NextResponse.json(
                { error: "Student role required" },
                { status: 403 }
            );
        }

        const assignments = await prisma.quizAssignment.findMany({
            where: { studentId: user.id },
            include: {
                quiz: {
                    include: {
                        _count: {
                            select: { questions: true, submissions: true },
                        },
                        questions: { select: { id: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(assignments);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch assignments" },
            { status: 500 }
        );
    }
}
