import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/utils/connect";

export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    role: string;
    isActive: boolean;
}

export async function getCurrentUser(
    req?: NextRequest
): Promise<AuthUser | null> {
    // Only work on server-side
    if (typeof window !== "undefined") {
        return null;
    }

    try {
        let token: string | undefined;

        if (req) {
            // Server-side: get from request cookies
            token = req.cookies.get("auth-token")?.value;
        }

        if (!token) {
            return null;
        }

        // Verify JWT token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your-secret-key"
        ) as { userId: string; email: string; role: string };

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
            },
        });

        return user;
    } catch (error) {
        console.error("Auth error:", error);
        return null;
    }
}

export async function requireAuth(req: NextRequest): Promise<AuthUser> {
    const user = await getCurrentUser(req);

    if (!user) {
        throw new Error("Authentication required");
    }

    if (!user.isActive) {
        throw new Error("Account is inactive");
    }

    return user;
}

export async function requireRole(
    req: NextRequest,
    role: string
): Promise<AuthUser> {
    const user = await requireAuth(req);

    if (user.role !== role) {
        throw new Error(`${role} role required`);
    }

    return user;
}

export async function requireAdmin(req: NextRequest): Promise<AuthUser> {
    return requireRole(req, "admin");
}

export async function requireTeacher(req: NextRequest): Promise<AuthUser> {
    const user = await requireAuth(req);

    if (user.role !== "teacher" && user.role !== "admin") {
        throw new Error("Teacher or admin role required");
    }

    return user;
}
