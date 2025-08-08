import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAdmin } from "@/utils/auth";
import { USER_ROLES } from "@/utils/roles";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        await requireAdmin(req);
        const { userId } = await params;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                createdQuizzes: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        isActive: true,
                        _count: {
                            select: {
                                submissions: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
                submissions: {
                    select: {
                        id: true,
                        score: true,
                        submittedAt: true,
                        quiz: {
                            select: {
                                title: true,
                            },
                        },
                    },
                    orderBy: { submittedAt: "desc" },
                    take: 10,
                },
                tasks: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
                _count: {
                    select: {
                        createdQuizzes: true,
                        submissions: true,
                        tasks: true,
                        notifications: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error: any) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch user" },
            { status: error.message === "Admin role required" ? 403 : 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const admin = await requireAdmin(req);
        const { userId } = await params;
        const { name, email, role, isActive, bio } = await req.json();

        // Validate role if provided
        if (role && !Object.values(USER_ROLES).includes(role)) {
            return NextResponse.json(
                { error: "Invalid role" },
                { status: 400 }
            );
        }

        // Get current user data for audit log
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, isActive: true, name: true, email: true },
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(role && { role }),
                ...(typeof isActive === "boolean" && { isActive }),
                ...(bio && { bio }),
                updatedAt: new Date(),
            },
        });

        // Create audit log for significant changes
        const changes: any = {};
        if (role && role !== currentUser.role)
            changes.roleChanged = { from: currentUser.role, to: role };
        if (
            typeof isActive === "boolean" &&
            isActive !== currentUser.isActive
        ) {
            changes.statusChanged = {
                from: currentUser.isActive,
                to: isActive,
            };
        }

        if (Object.keys(changes).length > 0) {
            // TODO: Create audit log functionality if needed
            console.log(
                `Admin ${admin.email} updated user ${userId}:`,
                changes
            );
        }

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update user" },
            { status: error.message === "Admin role required" ? 403 : 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const admin = await requireAdmin(req);
        const { userId } = await params;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Don't allow deleting other admin users
        if (user.role === USER_ROLES.ADMIN && user.id !== admin.id) {
            return NextResponse.json(
                { error: "Cannot delete other admin users" },
                { status: 403 }
            );
        }

        // Don't allow deleting yourself
        if (user.id === admin.id) {
            return NextResponse.json(
                { error: "Cannot delete your own account" },
                { status: 403 }
            );
        }

        // Collect quizzes created by this user
        const createdQuizzes = await prisma.quiz.findMany({
            where: { creatorId: userId },
            select: { id: true },
        });

        // Perform cleanup in a transaction
        await prisma.$transaction(async (tx) => {
            // For each created quiz: delete submissions (answers cascade), assignments, then the quiz (questions/options cascade)
            for (const { id: qid } of createdQuizzes) {
                await tx.quizSubmission.deleteMany({ where: { quizId: qid } });
                await tx.quizAssignment.deleteMany({ where: { quizId: qid } });
                await tx.quiz.delete({ where: { id: qid } });
            }

            // Delete all of the user's own data
            await tx.quizSubmission.deleteMany({ where: { userId: userId } });
            await tx.quizAssignment.deleteMany({
                where: {
                    OR: [{ studentId: userId }, { assignedById: userId }],
                },
            });
            await tx.task.deleteMany({ where: { userId: userId } });
            await tx.notification.deleteMany({ where: { userId: userId } });
            await tx.questionBank.deleteMany({ where: { creatorId: userId } });

            // Finally delete the user
            await tx.user.delete({ where: { id: userId } });
        });

        // TODO: Create audit log functionality if needed
        console.log(`Admin ${admin.email} deleted user ${user.email}`);

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete user" },
            { status: error.message === "Admin role required" ? 403 : 500 }
        );
    }
}
