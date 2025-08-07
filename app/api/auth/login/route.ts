import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user || !user.password) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
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
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
