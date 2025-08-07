#!/usr/bin/env node

/**
 * Admin Promotion Script
 * This script promotes a user to admin role by email address
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function promoteToAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.error("❌ Please provide an email address");
        console.log("Usage: node scripts/make-admin.js user@example.com");
        process.exit(1);
    }

    try {
        console.log(`🔍 Looking for user with email: ${email}`);

        // Find the user by email
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: "insensitive",
                },
            },
        });

        if (!user) {
            console.error(`❌ User with email ${email} not found`);
            console.log("\nAvailable users:");
            const allUsers = await prisma.user.findMany({
                select: { email: true, name: true, role: true },
            });
            allUsers.forEach((u) => {
                console.log(`  - ${u.email} (${u.name}) [${u.role}]`);
            });
            process.exit(1);
        }

        if (user.role === "admin") {
            console.log(`✅ User ${email} is already an admin!`);
            process.exit(0);
        }

        console.log(`👤 Found user: ${user.name} (${user.email})`);
        console.log(`📝 Current role: ${user.role}`);
        console.log(`🚀 Promoting to admin...`);

        // Update user role to admin
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                role: "admin",
                updatedAt: new Date(),
            },
        });

        console.log(`🎉 Success! ${updatedUser.name} is now an admin!`);
        console.log(`📧 Email: ${updatedUser.email}`);
        console.log(`👑 Role: ${updatedUser.role}`);
        console.log(`\n✨ You can now access the admin panel at /admin`);
    } catch (error) {
        console.error("❌ Error promoting user to admin:", error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
promoteToAdmin();
