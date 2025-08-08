import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { getCurrentUser } from "@/utils/auth";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser(req);

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Only students can finish quizzes (assignment requirement removed)
        if (user.role !== "student") {
            return NextResponse.json(
                { error: "Only students are allowed to finish quizzes" },
                { status: 403 }
            );
        }

        const { quizId, score, responses } = await req.json();

        // validate the fields
        if (!quizId || typeof score !== "number" || !Array.isArray(responses)) {
            return NextResponse.json(
                { error: "Invalid request" },
                { status: 400 }
            );
        }

        // Use transaction for atomic operations
        const result = await prisma.$transaction(async (tx) => {
            // Calculate correct answers count
            const correctAnswers = responses.filter(
                (r: { isCorrect: boolean }) => r.isCorrect
            ).length;
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
                const answerData = responses.map(
                    (response: {
                        questionId: string;
                        optionId?: string;
                        isCorrect: boolean;
                    }) => ({
                        submissionId: submission.id,
                        questionId: response.questionId,
                        selectedOptionId: response.optionId,
                        isCorrect: response.isCorrect,
                    })
                );

                await tx.quizAnswer.createMany({
                    data: answerData,
                });
            }

            // Assignment updates removed

            return { submission };
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
