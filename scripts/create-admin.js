#!/usr/bin/env node

/**
 * Create Admin Script
 * This script creates an admin user with provided details
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createAdmin() {
    const clerkId = process.argv[2];
    const email = process.argv[3];
    const name = process.argv[4];

    if (!clerkId || !email) {
        console.error("❌ Please provide clerk ID and email");
        console.log(
            "Usage: node scripts/create-admin.js <clerkId> <email> [name]"
        );
        console.log(
            "Example: node scripts/create-admin.js user_abc123 admin@example.com 'Admin User'"
        );
        console.log(
            "\n💡 You can find your Clerk ID in the browser dev tools or Clerk dashboard"
        );
        process.exit(1);
    }

    try {
        console.log(`🔍 Checking if user already exists...`);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (existingUser) {
            console.log(
                `👤 User already exists: ${existingUser.name} (${existingUser.email})`
            );

            if (existingUser.role === "admin") {
                console.log(`✅ User is already an admin!`);
                process.exit(0);
            }

            console.log(`🚀 Updating existing user to admin...`);
            const updatedUser = await prisma.user.update({
                where: { clerkId },
                data: {
                    role: "admin",
                    updatedAt: new Date(),
                },
            });

            console.log(`🎉 Success! ${updatedUser.name} is now an admin!`);
            process.exit(0);
        }

        console.log(`👤 Creating new admin user...`);
        console.log(`📧 Email: ${email}`);
        console.log(`👑 Role: admin`);

        // Create new admin user
        const newUser = await prisma.user.create({
            data: {
                clerkId,
                email,
                name: name || "Admin User",
                role: "admin",
                isActive: true,
            },
        });

        console.log(`🎉 Success! Created new admin user!`);
        console.log(`👤 Name: ${newUser.name}`);
        console.log(`📧 Email: ${newUser.email}`);
        console.log(`👑 Role: ${newUser.role}`);
        console.log(`🆔 ID: ${newUser.id}`);
        console.log(`\n✨ You can now access the admin panel at /admin`);
    } catch (error) {
        console.error("❌ Error creating admin user:", error.message);

        if (error.code === "P2002") {
            console.log(
                "💡 This usually means a user with this email or Clerk ID already exists"
            );
        }

        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
createAdmin();
