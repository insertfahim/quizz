const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Simple quiz data for basic seeding
const quizzes = [
    {
        title: "General Knowledge Quiz",
        description: "Test your general knowledge with these questions",
        timeLimit: 15,
        questions: [
            {
                text: "What is the capital of France?",
                difficulty: "easy",
                type: "multiple_choice",
                explanation: "Paris is the capital and largest city of France.",
                options: [
                    { text: "London", isCorrect: false },
                    { text: "Berlin", isCorrect: false },
                    { text: "Paris", isCorrect: true },
                    { text: "Madrid", isCorrect: false },
                ],
            },
            {
                text: "Which planet is known as the Red Planet?",
                difficulty: "easy",
                type: "multiple_choice",
                explanation:
                    "Mars is called the Red Planet due to its reddish appearance.",
                options: [
                    { text: "Venus", isCorrect: false },
                    { text: "Mars", isCorrect: true },
                    { text: "Jupiter", isCorrect: false },
                    { text: "Saturn", isCorrect: false },
                ],
            },
        ],
    },
    {
        title: "Quick Math Quiz",
        description: "Basic mathematics questions",
        timeLimit: 10,
        questions: [
            {
                text: "What is 15 + 27?",
                difficulty: "easy",
                type: "multiple_choice",
                explanation: "15 + 27 = 42",
                options: [
                    { text: "40", isCorrect: false },
                    { text: "42", isCorrect: true },
                    { text: "44", isCorrect: false },
                    { text: "46", isCorrect: false },
                ],
            },
        ],
    },
];

async function main() {
    console.log("🌱 Starting basic database seeding...");

    try {
        // Optional: Clear existing data
        const clearData = process.argv.includes("--clear");

        if (clearData) {
            console.log("🧹 Clearing existing data...");
            await prisma.quizAnswer.deleteMany();
            await prisma.option.deleteMany();
            await prisma.question.deleteMany();
            await prisma.quizSubmission.deleteMany();
            await prisma.quiz.deleteMany();
            console.log("✅ Existing data cleared");
        }

        console.log("📝 Seeding quizzes...");
        let totalQuizzesCreated = 0;

        for (const quiz of quizzes) {
            // Check if quiz already exists
            const existingQuiz = await prisma.quiz.findFirst({
                where: { title: quiz.title },
            });

            if (existingQuiz) {
                console.log(`⏭️  Quiz already exists: ${quiz.title}`);
                continue;
            }

            // Create the quiz
            const createdQuiz = await prisma.quiz.create({
                data: {
                    title: quiz.title,
                    description: quiz.description,
                    timeLimit: quiz.timeLimit,
                    isActive: true,
                },
            });
            totalQuizzesCreated++;

            // Create questions
            for (const question of quiz.questions) {
                await prisma.question.create({
                    data: {
                        text: question.text,
                        quizId: createdQuiz.id,
                        difficulty: question.difficulty,
                        explanation: question.explanation,
                        type: question.type,
                        options: {
                            create: question.options,
                        },
                    },
                });
            }

            console.log(
                `✅ Created quiz: ${quiz.title} with ${quiz.questions.length} questions`
            );
        }

        console.log("\n🎉 Basic seeding completed!");
        console.log(`📊 Created ${totalQuizzesCreated} new quizzes`);
    } catch (error) {
        console.error("\n❌ Error during seeding:", error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log("🔌 Database connection closed");
    });
