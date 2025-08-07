const { PrismaClient } = require("@prisma/client");

// Import all question data
const programmingQuestions = require("../data/programmingQuestions.js");
const biologyQuestions = require("../data/biologyQuestions.js");
const chemistryQuestions = require("../data/chemistryQuestions.js");
const csQuestions = require("../data/csQuestions.js");
const dsQuestions = require("../data/dsQuestions.js");
const physicsQuestions = require("../data/physicsQuestions.js");
const mathematicsQuestions = require("../data/mathematicsQuestions.js");
const historyQuestions = require("../data/historyQuestions.js");
const geographyQuestions = require("../data/geographyQuestions.js");
const technologyQuestions = require("../data/technologyQuestions.js");
const artQuestions = require("../data/artQuestions.js");

const prisma = new PrismaClient();

// Enhanced categories data with images
const categories = [
    {
        name: "Science",
        description:
            "Science is the pursuit and application of knowledge and understanding of the natural and social world following a systematic methodology based on evidence.",
        image: "/categories/image--science.svg",
    },
    {
        name: "Technology",
        description:
            "Dive into the latest technological advancements and digital innovations.",
        image: "/categories/image--technology.svg",
    },
    {
        name: "Programming",
        description:
            "Learn about coding, software development, and programming languages.",
        image: "/categories/image--programming.svg",
    },
    {
        name: "Computer Science",
        description:
            "Understand the fundamentals of computers, algorithms, and computational thinking.",
        image: "/categories/image--computer-science.svg",
    },
    {
        name: "Mathematics",
        description:
            "Master the language of numbers, patterns, and logical reasoning.",
        image: "/categories/image--mathematics.svg",
    },
    {
        name: "History",
        description:
            "Discover the events, people, and civilizations that shaped our world.",
        image: "/categories/image--history.svg",
    },
    {
        name: "Art",
        description:
            "Appreciate creativity through various forms of artistic expression.",
        image: "/categories/image--art.svg",
    },
    {
        name: "Geography",
        description:
            "Explore the physical features, climates, and cultures of our planet.",
        image: "/categories/image--geography.svg",
    },
    {
        name: "Physics",
        description:
            "Unravel the laws governing matter, energy, and the universe.",
        image: "/categories/image--physics.svg",
    },
    {
        name: "Biology",
        description:
            "Study the science of living organisms and life processes.",
        image: "/categories/image--biology.svg",
    },
    {
        name: "Chemistry",
        description:
            "Explore the properties, composition, and behavior of matter.",
        image: "/categories/image--chemistry.svg",
    },
    {
        name: "Data Structures",
        description: "Learn about organizing and storing data efficiently.",
        image: "/categories/image--data-structures.svg",
    },
];

// All quizzes with their questions and specific images
const quizzes = [
    {
        title: "Computer Science Fundamentals",
        description:
            "Test your knowledge of basic computer science concepts including algorithms, data types, and computational thinking.",
        categoryName: "Computer Science",
        image: "/categories/image--computer-science-fundamentals.svg",
        questions: csQuestions,
        timeLimit: 20,
    },
    {
        title: "Programming Basics",
        description:
            "Assess your understanding of fundamental programming concepts, syntax, and best practices.",
        categoryName: "Programming",
        image: "/categories/image--programming-basics.svg",
        questions: programmingQuestions,
        timeLimit: 25,
    },
    {
        title: "Data Structures Mastery",
        description:
            "Challenge yourself with questions about arrays, linked lists, trees, and other data structures.",
        categoryName: "Data Structures",
        image: "/categories/image--data-structures-mastery.svg",
        questions: dsQuestions,
        timeLimit: 30,
    },
    {
        title: "Physics Principles",
        description:
            "Explore fundamental physics concepts from mechanics to thermodynamics.",
        categoryName: "Physics",
        image: "/categories/image--physics-principles.svg",
        questions: physicsQuestions,
        timeLimit: 25,
    },
    {
        title: "Biology Essentials",
        description:
            "Test your knowledge of life sciences, from cells to ecosystems.",
        categoryName: "Biology",
        image: "/categories/image--biology-essentials.svg",
        questions: biologyQuestions,
        timeLimit: 20,
    },
    {
        title: "Chemistry Fundamentals",
        description:
            "Explore atoms, molecules, reactions, and chemical principles.",
        categoryName: "Chemistry",
        image: "/categories/image--chemistry-fundamentals.svg",
        questions: chemistryQuestions,
        timeLimit: 25,
    },
    {
        title: "Mathematics Challenge",
        description: "Test your mathematical skills from algebra to calculus.",
        categoryName: "Mathematics",
        image: "/categories/image--mathematics-challenge.svg",
        questions: mathematicsQuestions,
        timeLimit: 30,
    },
    {
        title: "World History",
        description:
            "Journey through time and test your knowledge of historical events and figures.",
        categoryName: "History",
        image: "/categories/image--world-history.svg",
        questions: historyQuestions,
        timeLimit: 20,
    },
    {
        title: "Geography Explorer",
        description:
            "Navigate through continents, countries, and geographical features.",
        categoryName: "Geography",
        image: "/categories/image--geography-explorer.svg",
        questions: geographyQuestions,
        timeLimit: 20,
    },
    {
        title: "Technology Trends",
        description:
            "Stay updated with modern technology, innovations, and digital concepts.",
        categoryName: "Technology",
        image: "/categories/image--technology-trends.svg",
        questions: technologyQuestions,
        timeLimit: 15,
    },
    {
        title: "Art Appreciation",
        description:
            "Explore the world of art, from classical masterpieces to modern movements.",
        categoryName: "Art",
        image: "/categories/image--art-appreciation.svg",
        questions: artQuestions,
        timeLimit: 20,
    },
    {
        title: "Advanced Programming",
        description:
            "Deep dive into advanced programming concepts and techniques.",
        categoryName: "Programming",
        image: "/categories/image--advanced-programming.svg",
        questions: programmingQuestions.slice(5, 15), // Using subset for variety
        timeLimit: 25,
    },
    {
        title: "General Science Quiz",
        description: "A mix of questions from various science disciplines.",
        categoryName: "Science",
        image: "/categories/image--general-science-quiz.svg",
        questions: [
            ...physicsQuestions.slice(0, 3),
            ...chemistryQuestions.slice(0, 3),
            ...biologyQuestions.slice(0, 4),
        ],
        timeLimit: 20,
    },
];

async function main() {
    console.log("🌱 Starting comprehensive database seeding...");
    console.log("================================================");

    try {
        // Optional: Clear existing data (comment out to preserve existing data)
        const clearData = process.argv.includes("--clear");

        if (clearData) {
            console.log("🧹 Clearing existing data...");
            await prisma.quizAnswer.deleteMany();
            await prisma.option.deleteMany();
            await prisma.question.deleteMany();
            await prisma.quizSubmission.deleteMany();
            await prisma.quiz.deleteMany();
            await prisma.categoryStat.deleteMany();
            await prisma.category.deleteMany();
            // Don't delete users to preserve authentication
            console.log("✅ Existing data cleared (users preserved)");
        }

        // 1. Seed Categories
        console.log("\n📂 Seeding categories...");
        const createdCategories = [];

        for (const category of categories) {
            // Check if category exists
            const existingCategory = await prisma.category.findFirst({
                where: { name: category.name },
            });

            if (existingCategory) {
                createdCategories.push(existingCategory);
                console.log(`⏭️  Category already exists: ${category.name}`);
            } else {
                const createdCategory = await prisma.category.create({
                    data: category,
                });
                createdCategories.push(createdCategory);
                console.log(`✅ Created category: ${createdCategory.name}`);
            }
        }

        // 2. Seed Quizzes
        console.log("\n📝 Seeding quizzes...");
        let totalQuizzesCreated = 0;
        let totalQuestionsCreated = 0;

        for (const quiz of quizzes) {
            const category = createdCategories.find(
                (cat) => cat.name === quiz.categoryName
            );

            if (!category) {
                console.log(`❌ Category not found for quiz: ${quiz.title}`);
                continue;
            }

            // Check if quiz already exists
            const existingQuiz = await prisma.quiz.findFirst({
                where: {
                    title: quiz.title,
                    categoryId: category.id,
                },
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
                    image: quiz.image,
                    categoryId: category.id,
                    timeLimit: quiz.timeLimit,
                    isActive: true,
                },
            });
            totalQuizzesCreated++;
            console.log(
                `✅ Created quiz: ${quiz.title} (${quiz.questions.length} questions)`
            );

            // 3. Seed Questions and Options for this quiz
            for (const question of quiz.questions) {
                try {
                    const createdQuestion = await prisma.question.create({
                        data: {
                            text: question.text,
                            quizId: createdQuiz.id,
                            difficulty: question.difficulty || "Medium",
                            explanation: question.explanation || null,
                            type:
                                question.options.length === 2 &&
                                question.options.some(
                                    (opt) =>
                                        opt.text === "True" ||
                                        opt.text === "False"
                                )
                                    ? "true_false"
                                    : "multiple_choice",
                            options: {
                                create: question.options.map((option) => ({
                                    text: option.text,
                                    isCorrect: option.isCorrect,
                                })),
                            },
                        },
                    });
                    totalQuestionsCreated++;
                } catch (error) {
                    console.error(
                        `❌ Error creating question: ${question.text.substring(
                            0,
                            50
                        )}...`
                    );
                    console.error(error.message);
                }
            }
        }

        // 4. Summary
        console.log("\n================================================");
        console.log("🎉 Database seeding completed successfully!");
        console.log("\n📊 Summary:");
        console.log(`   - Categories: ${createdCategories.length}`);
        console.log(`   - New Quizzes: ${totalQuizzesCreated}`);
        console.log(`   - New Questions: ${totalQuestionsCreated}`);

        // Final counts
        const finalCounts = await prisma.$transaction([
            prisma.category.count(),
            prisma.quiz.count(),
            prisma.question.count(),
            prisma.option.count(),
        ]);

        console.log("\n📈 Total Database Contents:");
        console.log(`   - Total Categories: ${finalCounts[0]}`);
        console.log(`   - Total Quizzes: ${finalCounts[1]}`);
        console.log(`   - Total Questions: ${finalCounts[2]}`);
        console.log(`   - Total Options: ${finalCounts[3]}`);
    } catch (error) {
        console.error("\n❌ Error during seeding:", error);
        throw error;
    }
}

// Run the seeding
main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log("\n🔌 Database connection closed");
        console.log("✨ Seeding complete! Your quiz app is ready to use.");
    });
