#!/usr/bin/env node

/**
 * User List Script
 * This script lists all users in the database with their roles
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function listUsers() {
    try {
        console.log("👥 Fetching all users...\n");

        const users = await prisma.user.findMany({
            select: {
                id: true,
                clerkId: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                lastLoginAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        if (users.length === 0) {
            console.log("❌ No users found in the database");
            return;
        }

        console.log(`📊 Found ${users.length} user(s):\n`);
        console.log(
            "ID".padEnd(8) +
                "NAME".padEnd(20) +
                "EMAIL".padEnd(30) +
                "ROLE".padEnd(10) +
                "STATUS".padEnd(10) +
                "CREATED"
        );
        console.log("-".repeat(90));

        users.forEach((user) => {
            const id = user.id.substring(0, 8);
            const name = (user.name || "N/A").substring(0, 18).padEnd(20);
            const email = (user.email || "N/A").substring(0, 28).padEnd(30);
            const role = user.role.padEnd(10);
            const status = (user.isActive ? "Active" : "Inactive").padEnd(10);
            const created = user.createdAt.toLocaleDateString();

            console.log(`${id}${name}${email}${role}${status}${created}`);
        });

        console.log("-".repeat(90));

        // Summary by role
        const roleCount = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {});

        console.log("\n📈 Summary by role:");
        Object.entries(roleCount).forEach(([role, count]) => {
            console.log(`  ${role}: ${count}`);
        });

        console.log("\n💡 To make a user admin, run:");
        console.log("node scripts/make-admin.js user@email.com");
    } catch (error) {
        console.error("❌ Error fetching users:", error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
listUsers();
