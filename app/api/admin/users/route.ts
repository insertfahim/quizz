import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAdmin } from "@/utils/auth";
import { USER_ROLES } from "@/utils/roles";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
    try {
        await requireAdmin(req);

        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "";

        const skip = (page - 1) * limit;

        // Build where clause
        const whereClause: any = {};

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }

        if (role && Object.values(USER_ROLES).includes(role as any)) {
            whereClause.role = role;
        }

        // Get users with pagination
        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    clerkId: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            createdQuizzes: true,
                            submissions: true,
                            tasks: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where: whereClause }),
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error: any) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch users" },
            { status: error.message === "Admin role required" ? 403 : 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const admin = await requireAdmin(req);
        const { name, email, role, password } = await req.json();

        // Validate required fields
        if (!name || !email || !role || !password) {
            return NextResponse.json(
                { error: "Name, email, role, and password are required" },
                { status: 400 }
            );
        }

        // Validate role
        if (!Object.values(USER_ROLES).includes(role)) {
            return NextResponse.json(
                { error: "Invalid role" },
                { status: 400 }
            );
        }

        // Validate password
        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Check if user already exists by email
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

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role,
                isActive: true,
            },
        });

        // TODO: Create audit log functionality if needed
        console.log(
            `Admin ${admin.email} created user ${newUser.email} with role ${role}`
        );

        // Remove password from response
        const { password: _, ...userResponse } = newUser;
        return NextResponse.json(userResponse);
    } catch (error: any) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create user" },
            { status: error.message === "Admin role required" ? 403 : 500 }
        );
    }
}
