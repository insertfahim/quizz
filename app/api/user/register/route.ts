import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { USER_ROLES } from "@/utils/roles";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        const clerkUser = await currentUser();

        if (!userId || !clerkUser) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { role } = await req.json();

        // Validate role
        const validRoles = Object.values(USER_ROLES);
        const userRole = validRoles.includes(role) ? role : USER_ROLES.STUDENT;

        // check if the user exists in the db
        let user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        //if user does not exist, create a new user
        if (!user) {
            user = await prisma.user.create({
                data: {
                    clerkId: userId,
                    role: userRole,
                    name: clerkUser.fullName,
                    email: clerkUser.emailAddresses[0]?.emailAddress,
                },
            });
            console.log(`New ${userRole} user created:`, user.email);
        } else {
            // Update existing user's role and profile if needed
            user = await prisma.user.update({
                where: { clerkId: userId },
                data: {
                    role: userRole,
                    name: clerkUser.fullName,
                    email: clerkUser.emailAddresses[0]?.emailAddress,
                },
            });
            console.log("User profile updated");
        }

        return NextResponse.json(user);
    } catch (error) {
        console.log("Error registering user: ", error);
        return NextResponse.json(
            { error: "Error creating user" },
            { status: 500 }
        );
    }
}
