import { auth } from "@clerk/nextjs/server";
import React from "react";
import prisma from "@/utils/connect";
import { IQuiz } from "@/types/types";
import QuizCard from "@/components/quiz/QuizCard";

async function page({ params }: any) {
    const { categoryId } = await params;
    const { userId } = await auth();

    if (!categoryId) {
        return (
            <div className="text-center mt-8">
                <h1 className="text-2xl">Category not found</h1>
            </div>
        );
    }

    // Validate if categoryId is a valid MongoDB ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(categoryId);
    if (!isValidObjectId) {
        return (
            <div className="text-center mt-8">
                <h1 className="text-2xl">Invalid category ID</h1>
            </div>
        );
    }

    try {
        // First get the category to display its name
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            return (
                <div className="text-center mt-8">
                    <h1 className="text-2xl">Category not found</h1>
                </div>
            );
        }

        const quizzes = await prisma.quiz.findMany({
            where: { categoryId },
            include: {
                questions: {
                    select: {
                        id: true,
                        text: true,
                        difficulty: true,
                        explanation: true,
                        options: {
                            select: {
                                id: true,
                                text: true,
                                isCorrect: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return (
            <div>
                <h1 className="mb-6 text-4xl font-bold">{category.name} Quizzes</h1>

                {quizzes.length > 0 ? (
                    <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
                        {quizzes.map((quiz) => (
                            <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                ) : (
                    <h1 className="text-2xl text-center mt-4">
                        No quizzes found for {category.name}
                    </h1>
                )}
            </div>
        );
    } catch (error) {
        console.error("Error loading category:", error);
        return (
            <div className="text-center mt-8">
                <h1 className="text-2xl">Error loading category</h1>
                <p className="mt-2 text-gray-600">Please try again later</p>
            </div>
        );
    }
}

export default page;