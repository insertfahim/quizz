#!/usr/bin/env node

/**
 * Database Setup Script
 * This script helps set up the database for the Kwizi application
 */

const { execSync } = require("child_process");
const path = require("path");

console.log("🚀 Setting up Kwizi Database...\n");

// Check if .env.local exists and has DATABASE_URL
const fs = require("fs");
const envPath = path.join(__dirname, "..", ".env.local");

if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local file not found!");
    console.log("Please create a .env.local file with your DATABASE_URL");
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
if (!envContent.includes("DATABASE_URL=")) {
    console.error("❌ DATABASE_URL not found in .env.local!");
    console.log("Please add your MongoDB connection string to .env.local:");
    console.log(
        'DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/kwizi?retryWrites=true&w=majority"'
    );
    process.exit(1);
}

if (
    envContent.includes("# DATABASE_URL=") ||
    envContent.includes('DATABASE_URL=""')
) {
    console.error("❌ DATABASE_URL is commented out or empty!");
    console.log(
        "Please uncomment and add your actual MongoDB connection string"
    );
    process.exit(1);
}

try {
    console.log("1️⃣ Generating Prisma client...");
    execSync("npx prisma generate", {
        stdio: "inherit",
        cwd: path.dirname(__dirname),
    });

    console.log("\n2️⃣ Pushing schema to database...");
    execSync("npx prisma db push", {
        stdio: "inherit",
        cwd: path.dirname(__dirname),
    });

    console.log("\n3️⃣ Seeding database with initial data...");
    execSync("node scripts/seed.js", {
        stdio: "inherit",
        cwd: path.dirname(__dirname),
    });

    console.log("\n🎉 Database setup completed successfully!");
    console.log("\n📝 Next steps:");
    console.log('1. Run "npm run dev" to start the development server');
    console.log("2. Visit http://localhost:3000 to see your application");
    console.log(
        '3. Use "npm run db:studio" to view your database in Prisma Studio'
    );
} catch (error) {
    console.error("\n❌ Database setup failed:", error.message);
    console.log("\n🔧 Troubleshooting tips:");
    console.log("1. Make sure your DATABASE_URL is correct");
    console.log("2. Check your internet connection");
    console.log("3. Verify your MongoDB cluster is running");
    console.log("4. Try running the commands individually:");
    console.log("   - npx prisma generate");
    console.log("   - npx prisma db push");
    console.log("   - npm run db:seed");
    process.exit(1);
}
