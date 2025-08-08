import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireTeacher } from "@/utils/auth";

// GET: list assignments created by the current teacher/admin
export async function GET(req: NextRequest) {
    try {
        const teacher = await requireTeacher(req);

        const assignments = await prisma.quizAssignment.findMany({
            where: { assignedById: teacher.id },
            include: {
                quiz: {
                    include: {
                        _count: {
                            select: { questions: true, submissions: true },
                        },
                    },
                },
                student: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(assignments);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch assignments" },
            { status: error.message?.includes("required") ? 403 : 500 }
        );
    }
}

// POST: create assignments for one quiz to one or more students
// body: { quizId: string, studentIds: string[], dueDate?: string }
export async function POST(req: NextRequest) {
    try {
        const teacher = await requireTeacher(req);
        const { quizId, studentIds, dueDate } = await req.json();

        if (!quizId || !Array.isArray(studentIds) || studentIds.length === 0) {
            return NextResponse.json(
                { error: "quizId and studentIds are required" },
                { status: 400 }
            );
        }

        const quiz = await prisma.quiz.findFirst({
            where: { id: quizId, isActive: true },
        });
        if (!quiz) {
            return NextResponse.json(
                { error: "Quiz not found or inactive" },
                { status: 404 }
            );
        }

        const created: any[] = [];
        for (const studentId of studentIds) {
            // Avoid duplicate active assignment for same student+quiz
            const existing = await prisma.quizAssignment.findFirst({
                where: {
                    quizId,
                    studentId,
                    status: { in: ["assigned", "in_progress"] },
                },
            });
            if (existing) continue;

            const assignment = await prisma.quizAssignment.create({
                data: {
                    quizId,
                    studentId,
                    assignedById: teacher.id,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    status: "assigned",
                },
            });
            created.push(assignment);
        }

        return NextResponse.json({ created }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to create assignments" },
            { status: error.message?.includes("required") ? 403 : 500 }
        );
    }
}
