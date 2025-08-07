import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/connect";

export const USER_ROLES = {
    STUDENT: "student",
    TEACHER: "teacher",
    ADMIN: "admin",
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
 * Check if current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
    return hasRole(USER_ROLES.ADMIN);
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
 * Require admin role - throws error if not admin
 */
export async function requireAdmin() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Authentication required");
    }

    if (user.role !== USER_ROLES.ADMIN) {
        throw new Error("Admin role required");
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
 * Check if user can manage quiz (is admin, teacher or quiz creator)
 */
export async function canManageQuiz(quizId: string): Promise<boolean> {
    const user = await getCurrentUser();

    if (!user) {
        return false;
    }

    // Admins can manage any quiz
    if (user.role === USER_ROLES.ADMIN) {
        return true;
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

/**
 * Check if user has elevated privileges (admin or teacher)
 */
export async function hasElevatedPrivileges(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.TEACHER;
}

/**
 * Create audit log entry (admin only)
 */
export async function createAuditLog(
    action: string,
    targetType: string,
    targetId?: string,
    details?: any
) {
    const admin = await getCurrentUser();

    if (!admin || admin.role !== USER_ROLES.ADMIN) {
        return; // Only admins can create audit logs
    }

    try {
        await prisma.auditLog.create({
            data: {
                action,
                targetType,
                targetId,
                details,
                adminId: admin.id,
            },
        });
    } catch (error) {
        console.error("Error creating audit log:", error);
    }
}
