#!/usr/bin/env node

/**
 * Create Local Admin Script
 * This script creates an admin user for the local auth system
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createLocalAdmin() {
    const email = process.argv[2] || "admin@example.com";
    const password = process.argv[3] || "admin123";
    const name = process.argv[4] || "Administrator";

    console.log("🚀 Creating local admin user...");
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🔐 Password: ${password}`);

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            console.log(`⚠️  User with email ${email} already exists!`);

            if (existingUser.role === "admin") {
                console.log(`✅ User is already an admin!`);

                // Update password if provided
                if (process.argv[3]) {
                    const hashedPassword = await bcrypt.hash(password, 12);
                    await prisma.user.update({
                        where: { email: email.toLowerCase() },
                        data: {
                            password: hashedPassword,
                            updatedAt: new Date(),
                        },
                    });
                    console.log(`🔐 Password updated!`);
                }

                return;
            }

            // Update existing user to admin
            const hashedPassword = await bcrypt.hash(password, 12);
            const updatedUser = await prisma.user.update({
                where: { email: email.toLowerCase() },
                data: {
                    role: "admin",
                    password: hashedPassword,
                    updatedAt: new Date(),
                },
            });

            console.log(`🎉 Updated ${updatedUser.name} to admin!`);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new admin user
        const newUser = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
                role: "admin",
                isActive: true,
            },
        });

        console.log(`🎉 Admin user created successfully!`);
        console.log(`🆔 ID: ${newUser.id}`);
        console.log(`📧 Email: ${newUser.email}`);
        console.log(`👤 Name: ${newUser.name}`);
        console.log(`👑 Role: ${newUser.role}`);
        console.log(`\n✨ You can now login at /login with these credentials`);
    } catch (error) {
        console.error("❌ Error creating admin user:", error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

console.log("🔧 Local Admin User Creator");
console.log(
    "Usage: node scripts/create-local-admin.js [email] [password] [name]"
);
console.log(
    "Example: node scripts/create-local-admin.js admin@test.com mypassword 'Admin User'"
);
console.log("Defaults: admin@example.com, admin123, Administrator\n");

createLocalAdmin();
