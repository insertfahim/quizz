import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireTeacher } from "@/utils/auth";

// PUT update a question
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ questionId: string }> }
) {
    try {
        const user = await requireTeacher(req);

        const { questionId } = await params;
        const body = await req.json();
        const {
            text,
            type,
            difficulty,
            explanation,
            category,
            isShared,
            options,
            correctAnswer,
        } = body;

        const question = await prisma.questionBank.update({
            where: {
                id: questionId,
                creatorId: user.id, // Only owner can update
            },
            data: {
                text,
                type,
                difficulty,
                explanation,
                category,
                isShared,
                options: options ?? null,
                correctAnswer,
            },
        });

        return NextResponse.json(question);
    } catch (error) {
        console.error("Error updating question:", error);
        return NextResponse.json(
            { error: "Failed to update question" },
            { status: 500 }
        );
    }
}

// DELETE a question
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ questionId: string }> }
) {
    try {
        const user = await requireTeacher(req);

        const { questionId } = await params;
        await prisma.questionBank.delete({
            where: {
                id: questionId,
                creatorId: user.id, // Only owner can delete
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting question:", error);
        return NextResponse.json(
            { error: "Failed to delete question" },
            { status: 500 }
        );
    }
}
