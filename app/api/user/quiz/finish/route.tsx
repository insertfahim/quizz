import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function POST(req: NextRequest) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { categoryId, quizId, score, responses } = await req.json();

        // validate the fields
        if (
            !categoryId ||
            !quizId ||
            typeof score !== "number" ||
            !Array.isArray(responses)
        ) {
            return NextResponse.json(
                { error: "Invalid request" },
                { status: 400 }
            );
        }

        // Use transaction for atomic operations
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { clerkId } });

            if (!user) {
                throw new Error("User not found");
            }

            // fetch or create a categoryStat entry
            let stat = await tx.categoryStat.findUnique({
                where: {
                    userId_categoryId: {
                        userId: user.id,
                        categoryId,
                    },
                },
            });

            if (stat) {
                // calculate the average score
                const totalScore =
                    (stat.averageScore || 0) * stat.completed + score;
                const newAverageScore = totalScore / (stat.completed + 1);

                // update the categoryStat entry
                stat = await tx.categoryStat.update({
                    where: { id: stat.id },
                    data: {
                        completed: stat.completed + 1,
                        averageScore: newAverageScore,
                        lastAttempt: new Date(),
                    },
                });
            } else {
                // create a new categoryStat entry
                // Note: attempts should already be incremented when quiz starts
                // If this is the first time, set attempts to 1
                stat = await tx.categoryStat.create({
                    data: {
                        userId: user.id,
                        categoryId,
                        attempts: 1,
                        completed: 1,
                        averageScore: score,
                        lastAttempt: new Date(),
                    },
                });
            }

            // Calculate correct answers count
            const correctAnswers = responses.filter((r: any) => r.isCorrect).length;
            const totalQuestions = responses.length;

            // Check if submission already exists (for retakes)
            const existingSubmission = await tx.quizSubmission.findUnique({
                where: {
                    userId_quizId: {
                        userId: user.id,
                        quizId,
                    },
                },
            });

            // Create or update QuizSubmission record
            const submission = existingSubmission
                ? await tx.quizSubmission.update({
                    where: {
                        userId_quizId: {
                            userId: user.id,
                            quizId,
                        },
                    },
                    data: {
                        score,
                        totalQuestions,
                        correctAnswers,
                        submittedAt: new Date(),
                    },
                })
                : await tx.quizSubmission.create({
                    data: {
                        userId: user.id,
                        quizId,
                        score,
                        totalQuestions,
                        correctAnswers,
                        submittedAt: new Date(),
                    },
                });

            // If updating submission, delete old answers first
            if (existingSubmission) {
                await tx.quizAnswer.deleteMany({
                    where: {
                        submissionId: submission.id,
                    },
                });
            }

            // Create QuizAnswer records for each response
            if (responses.length > 0) {
                const answerData = responses.map((response: any) => ({
                    submissionId: submission.id,
                    questionId: response.questionId,
                    selectedOptionId: response.optionId,
                    isCorrect: response.isCorrect,
                }));

                await tx.quizAnswer.createMany({
                    data: answerData,
                });
            }

            return { stat, submission };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error finishing quiz: ", error);
        return NextResponse.json(
            { error: "Error finishing quiz" },
            { status: 500 }
        );
    }
}
