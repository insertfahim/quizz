"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { IQuiz } from "@/types/types";
import QuizCard from "@/components/quiz/QuizCard";
import Loader from "@/components/Loader";

export default function QuizzesPage() {
    const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const res = await axios.get("/api/quizzes");
                setQuizzes(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                setError("Failed to load quizzes");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (isLoading) return <Loader />;

    return (
        <div className="min-h-screen py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold">All Quizzes</h1>
                    {error && (
                        <p className="text-red-500 mt-2 text-sm">{error}</p>
                    )}
                </div>

                {quizzes.length === 0 ? (
                    <p className="text-gray-600">No quizzes available.</p>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                            <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
