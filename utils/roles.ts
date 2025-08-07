import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/connect";

export const USER_ROLES = {
    STUDENT: "student",
    TEACHER: "teacher",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Get current user with role information
 */
export async function getCurrentUser() {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return null;
        }

        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        return user;
    } catch (error) {
        // Auth not available, return null
        console.log("Auth not available in getCurrentUser");
        return null;
    }
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === role;
}

/**
 * Check if current user is a teacher
 */
export async function isTeacher(): Promise<boolean> {
    return hasRole(USER_ROLES.TEACHER);
}

/**
 * Check if current user is a student
 */
export async function isStudent(): Promise<boolean> {
    return hasRole(USER_ROLES.STUDENT);
}

/**
 * Require teacher role - throws error if not teacher
 */
export async function requireTeacher() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Authentication required");
    }

    if (user.role !== USER_ROLES.TEACHER) {
        throw new Error("Teacher role required");
    }

    return user;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Authentication required");
    }

    return user;
}

/**
 * Check if user can manage quiz (is teacher or quiz creator)
 */
export async function canManageQuiz(quizId: string): Promise<boolean> {
    const user = await getCurrentUser();

    if (!user) {
        return false;
    }

    // Teachers can manage any quiz
    if (user.role === USER_ROLES.TEACHER) {
        return true;
    }

    // Check if user created this quiz
    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        select: { creatorId: true },
    });

    return quiz?.creatorId === user.id;
}
