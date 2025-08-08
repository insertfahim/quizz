import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireTeacher } from "@/utils/auth";

// GET /api/teacher/students - list all students (basic info) for teacher visibility
export async function GET(req: NextRequest) {
    try {
        await requireTeacher(req);

        const students = await prisma.user.findMany({
            where: { role: "student" },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                _count: {
                    select: {
                        submissions: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(students);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch students" },
            { status: error.message?.includes("required") ? 403 : 500 }
        );
    }
}
