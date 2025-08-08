"use client";
import { IQuiz } from "@/types/types";
import { dots } from "@/utils/Icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "@/context/AuthContext";

interface Props {
    quiz: IQuiz;
    allowUnassigned?: boolean; // when true, clicking allows unassigned attempt
}

function QuizCard({ quiz, allowUnassigned = false }: Props) {
    const router = useRouter();
    const { isAdmin, isTeacher } = useAuth();

    const handleClick = () => {
        if (isAdmin || isTeacher) {
            return;
        }
        // Store quiz data in localStorage for the setup page
        localStorage.setItem("selectedQuiz", JSON.stringify(quiz));
        if (allowUnassigned) {
            try {
                localStorage.setItem("allowUnassignedQuizStart", quiz.id);
            } catch (_) {}
        } else {
            try {
                const flag = localStorage.getItem("allowUnassignedQuizStart");
                if (flag === quiz.id) {
                    localStorage.removeItem("allowUnassignedQuizStart");
                }
            } catch (_) {}
        }
        router.push(`/quiz/setup/${quiz.id}`);
    };

    return (
        <div
            className="border-2 rounded-xl p-1 cursor-pointer shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]
        hover:-translate-y-1 transition-transform duration-300 ease-in-out"
            onClick={handleClick}
        >
            <div className="py-2 px-6 flex flex-col gap-4">
                <div className="rounded-xl h-[16rem] py-1 bg-[#97dbff]/20">
                    <Image
                        src={
                            quiz.image
                                ? quiz.image
                                : `/categories/image--${quiz.title
                                      .toLowerCase()
                                      .split(" ")
                                      .join("-")}.svg`
                        }
                        alt="quiz image"
                        width={300}
                        height={200}
                        className="h-full rounded-xl"
                    />
                </div>

                <div>
                    <h2 className="text-xl font-bold">{quiz.title}</h2>
                    <p className="text-gray-600 leading-none font-semibold">
                        {quiz.description}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-gray-400 semi-bold text-sm flex items-center gap-2 leading-none">
                        <span className="text-xl">{dots}</span>
                        <span>
                            Total Questions:{" "}
                            <span className="font-bold text-gray-600">
                                {quiz.questions.length}
                            </span>
                        </span>
                    </p>
                    {(isAdmin || isTeacher) && (
                        <span className="text-xs font-semibold text-red-500">
                            Only students can take quizzes
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default QuizCard;
