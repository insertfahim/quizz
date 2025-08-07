const { PrismaClient } = require("@prisma/client");

let quizzesPrisma: any;

const quizzes = [
    {
        title: "Computer Science Basics",
        description: "A quiz about fundamental computer science concepts.",
        timeLimit: 20,
        isActive: true,
    },
    {
        title: "Programming Fundamentals",
        description: "Test your knowledge of basic programming concepts.",
        timeLimit: 25,
        isActive: true,
    },
    {
        title: "Data Structures",
        description: "Assess your understanding of data structures.",
        timeLimit: 30,
        isActive: true,
    },
    {
        title: "Physics",
        description: "Test your knowledge of physics",
        timeLimit: 25,
        isActive: true,
    },
    {
        title: "Biology",
        description: "Test your knowledge of biology",
        timeLimit: 20,
        isActive: true,
    },
    {
        title: "Chemistry",
        description: "Test your knowledge of chemistry",
        timeLimit: 25,
        isActive: true,
    },
];

async function seedQuizzes() {
    quizzesPrisma = new PrismaClient();

    console.log("Seeding quizzes...");

    for (const quiz of quizzes) {
        // Check if quiz already exists
        const existingQuiz = await quizzesPrisma.quiz.findFirst({
            where: { title: quiz.title },
        });

        if (existingQuiz) {
            console.log(`Quiz already exists: ${quiz.title}`);
            continue;
        }

        const createdQuiz = await quizzesPrisma.quiz.create({
            data: quiz,
        });

        console.log("Created quiz: ", `${createdQuiz.title}`);
    }

    console.log("Seeding quizzes completed.");
}

seedQuizzes()
    .catch((e) => {
        console.log("Error seeding quizzes: ", e);
    })
    .finally(async () => {
        await quizzesPrisma.$disconnect();
    });
