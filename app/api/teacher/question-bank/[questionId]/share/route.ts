import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireTeacher } from "@/utils/auth";

// PATCH toggle share status
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ questionId: string }> }
) {
    try {
        const user = await requireTeacher(req);

        const { questionId } = await params;
        const body = await req.json();
        const { isShared } = body;

        const question = await prisma.questionBank.update({
            where: {
                id: questionId,
                creatorId: user.id, // Only owner can change share status
            },
            data: {
                isShared,
            },
        });

        return NextResponse.json(question);
    } catch (error) {
        console.error("Error updating share status:", error);
        return NextResponse.json(
            { error: "Failed to update share status" },
            { status: 500 }
        );
    }
}
