const { PrismaClient } = require("@prisma/client");

// Import question data
const programmingQuestions = require("../data/programmingQuestions.js");
const biologyQuestions = require("../data/biologyQuestions.js");
const chemistryQuestions = require("../data/chemistryQuestions.js");
const csQuestions = require("../data/csQuestions.js");
const dsQuestions = require("../data/dsQuestions.js");
const physicsQuestions = require("../data/physicsQuestions.js");

const prisma = new PrismaClient();

// Categories data
const categories = [
    {
        name: "Science",
        description:
            "Science is the pursuit and application of knowledge and understanding of the natural and social world following a systematic methodology based on evidence.",
    },
    {
        name: "Technology",
        description: "Dive into the latest technological advancements.",
    },
    {
        name: "Programming",
        description: "Learn about coding and software development.",
    },
    {
        name: "Computer Science",
        description: "Understand the fundamentals of computers and algorithms.",
    },
    {
        name: "Mathematics",
        description: "Master the language of numbers and patterns.",
    },
    {
        name: "History",
        description: "Discover the events that shaped our world.",
    },
    {
        name: "Art",
        description: "Appreciate creativity through various forms of art.",
    },
    {
        name: "Geography",
        description: "Explore the physical features of our planet.",
    },
    {
        name: "Physics",
        description: "Unravel the laws governing the universe.",
    },
    {
        name: "Biology",
        description: "Study the science of living organisms.",
    },
];

async function main() {
    console.log("🌱 Starting database seeding...");

    try {
        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log("🧹 Cleaning existing data...");
        await prisma.option.deleteMany();
        await prisma.question.deleteMany();
        await prisma.quiz.deleteMany();
        await prisma.categoryStat.deleteMany();
        await prisma.category.deleteMany();
        await prisma.user.deleteMany();

        // 1. Seed Categories
        console.log("📂 Seeding categories...");
        const createdCategories = [];
        for (const category of categories) {
            const createdCategory = await prisma.category.create({
                data: category,
            });
            createdCategories.push(createdCategory);
            console.log(`✅ Created category: ${createdCategory.name}`);
        }

        // 2. Seed Quizzes
        console.log("📝 Seeding quizzes...");
        const quizzes = [
            {
                title: "Computer Science Basics",
                description:
                    "A quiz about fundamental computer science concepts.",
                categoryName: "Computer Science",
                questions: csQuestions,
            },
            {
                title: "Programming Fundamentals",
                description:
                    "Test your knowledge of basic programming concepts.",
                categoryName: "Programming",
                questions: programmingQuestions,
            },
            {
                title: "Data Structures",
                description: "Assess your understanding of data structures.",
                categoryName: "Computer Science",
                questions: dsQuestions,
            },
            {
                title: "Physics",
                description: "Test your knowledge of physics",
                categoryName: "Physics",
                questions: physicsQuestions,
            },
            {
                title: "Biology",
                description: "Test your knowledge of biology",
                categoryName: "Biology",
                questions: biologyQuestions,
            },
            {
                title: "Chemistry",
                description: "Test your knowledge of chemistry",
                categoryName: "Science",
                questions: chemistryQuestions,
            },
        ];

        const createdQuizzes = [];
        for (const quiz of quizzes) {
            const category = createdCategories.find(
                (cat) => cat.name === quiz.categoryName
            );
            if (!category) {
                console.log(`❌ Category not found for quiz: ${quiz.title}`);
                continue;
            }

            const createdQuiz = await prisma.quiz.create({
                data: {
                    title: quiz.title,
                    description: quiz.description,
                    categoryId: category.id,
                },
            });

            createdQuizzes.push({ ...createdQuiz, questions: quiz.questions });
            console.log(`✅ Created quiz: ${createdQuiz.title}`);
        }

        // 3. Seed Questions and Options
        console.log("❓ Seeding questions and options...");
        for (const quiz of createdQuizzes) {
            if (!quiz.questions || quiz.questions.length === 0) {
                console.log(`⚠️ No questions found for quiz: ${quiz.title}`);
                continue;
            }

            for (const question of quiz.questions) {
                const createdQuestion = await prisma.question.create({
                    data: {
                        text: question.text,
                        quizId: quiz.id,
                        difficulty: question.difficulty,
                        options: {
                            create: question.options,
                        },
                    },
                });
                console.log(
                    `✅ Created question: ${createdQuestion.text.substring(
                        0,
                        50
                    )}...`
                );
            }
        }

        console.log("🎉 Database seeding completed successfully!");
        console.log(`📊 Summary:`);
        console.log(`   - Categories: ${createdCategories.length}`);
        console.log(`   - Quizzes: ${createdQuizzes.length}`);

        // Count total questions
        const totalQuestions = await prisma.question.count();
        const totalOptions = await prisma.option.count();
        console.log(`   - Questions: ${totalQuestions}`);
        console.log(`   - Options: ${totalOptions}`);
    } catch (error) {
        console.error("❌ Error during seeding:", error);
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
