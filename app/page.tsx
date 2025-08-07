"use client";

import { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/globalContext";
import { IQuiz } from "@/types/types";
import QuizCard from "@/components/quiz/QuizCard";
import axios from "axios";
import Loader from "@/components/Loader";

export default function Home() {
    const { loading } = useGlobalContext();
    const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/api/quizzes");
            setQuizzes(response.data);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading || isLoading) {
        return <Loader />;
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">Quiz Catalog</h1>

            {quizzes.length > 0 ? (
                <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6">
                    {quizzes.map((quiz) => (
                        <QuizCard key={quiz.id} quiz={quiz} />
                    ))}
                </div>
            ) : (
                <div className="text-center mt-8">
                    <h2 className="text-2xl text-gray-600">
                        No quizzes available
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Check back later for new quizzes!
                    </p>
                </div>
            )}
        </div>
    );
}
