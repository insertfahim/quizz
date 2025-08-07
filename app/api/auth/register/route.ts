import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { USER_ROLES } from "@/utils/roles";

export async function POST(req: NextRequest) {
    try {
        const { email, password, name, role } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "Email, password, and name are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Validate role
        const validRoles = Object.values(USER_ROLES);
        const userRole = validRoles.includes(role) ? role : USER_ROLES.STUDENT;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
                role: userRole,
                isActive: true,
            },
        });

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );

        // Set HTTP-only cookie
        const response = NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.isActive,
            },
        });

        response.cookies.set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
