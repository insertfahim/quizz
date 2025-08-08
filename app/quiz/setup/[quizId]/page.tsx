"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { play } from "@/utils/Icons";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";

function page() {
    const router = useRouter();
    const params = useParams();
    const { user, isAdmin } = useAuth();
    const [hasAssignment, setHasAssignment] = useState<boolean>(false);

    const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
    const [quizSetup, setQuizSetup] = useState({
        questionCount: 1,
        difficulty: "unspecified",
    });
    const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Try to get quiz from localStorage first
        const storedQuiz = localStorage.getItem("selectedQuiz");
        if (storedQuiz) {
            const quiz = JSON.parse(storedQuiz);
            setSelectedQuiz(quiz);
            setQuizSetup((prev) => ({
                ...prev,
                questionCount: quiz.questions?.length || 1,
            }));
        } else {
            // If no stored quiz, fetch by ID
            fetchQuizById(params.quizId as string);
        }
        // Check assignment for students
        const checkAssignment = async () => {
            try {
                const res = await axios.get("/api/user/assignments");
                const list = Array.isArray(res.data) ? res.data : [];
                const assigned = list.some(
                    (a: any) => a.quizId === params.quizId
                );
                setHasAssignment(assigned);
            } catch (e) {
                setHasAssignment(false);
            }
        };
        checkAssignment();
        setLoading(false);
    }, [params.quizId]);

    const fetchQuizById = async (quizId: string) => {
        try {
            const response = await axios.get(`/api/quizzes/${quizId}`);
            const quiz = response.data;
            setSelectedQuiz(quiz);
            localStorage.setItem("selectedQuiz", JSON.stringify(quiz));
            setQuizSetup((prev) => ({
                ...prev,
                questionCount: quiz.questions?.length || 1,
            }));
        } catch (error) {
            console.error("Error fetching quiz:", error);
            toast.error("Quiz not found");
            router.push("/");
        }
    };

    useEffect(() => {
        if (!selectedQuiz) return;

        const filtered =
            selectedQuiz.questions?.filter((q: { difficulty: string }) => {
                return (
                    !quizSetup.difficulty ||
                    quizSetup.difficulty === "unspecified" ||
                    q?.difficulty.toLowerCase() ===
                        quizSetup.difficulty.toLowerCase()
                );
            }) || [];

        setFilteredQuestions(filtered);
    }, [selectedQuiz, quizSetup]);

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        const maxQuestions = selectedQuiz?.questions.length || 1;

        const newCount =
            isNaN(value) || value < 1 ? 1 : Math.min(value, maxQuestions);

        setQuizSetup((prev) => ({ ...prev, questionCount: newCount }));
    };

    const handleDifficultyChange = (difficulty: string) => {
        setQuizSetup((prev) => ({ ...prev, difficulty }));
    };

    const startQuiz = async () => {
        if (!selectedQuiz) {
            toast.error("No quiz selected");
            return;
        }

        const questionsToUse = filteredQuestions.slice(
            0,
            quizSetup.questionCount
        );

        if (questionsToUse.length === 0) {
            toast.error("No questions found for the selected criteria");
            return;
        }

        try {
            // Store quiz setup and filtered questions for the quiz page
            localStorage.setItem("quizSetup", JSON.stringify(quizSetup));
            localStorage.setItem(
                "filteredQuestions",
                JSON.stringify(questionsToUse)
            );

            if (!user) {
                toast.error("You must be signed in to take assigned quizzes.");
                return;
            }

            if (isAdmin) {
                toast.error("Admins cannot take quizzes.");
                return;
            }

            if (!hasAssignment) {
                toast.error("This quiz is not assigned to you.");
                return;
            }

            // Start quiz attempt in database for authenticated users
            await axios.post("/api/user/quiz/start", {
                quizId: selectedQuiz.id,
            });

            // Navigate to quiz page
            router.push("/quiz");
        } catch (error) {
            console.error("Error starting quiz:", error);
            toast.error("Failed to start quiz. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!selectedQuiz) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-600">
                        Quiz not found
                    </h2>
                    <p className="text-gray-500 mt-2">
                        The quiz you're looking for doesn't exist.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="py-[6rem] w-[50%] fixed left-1/2 top-[45%] translate-x-[-50%] translate-y-[-50%] p-6 border-2 rounded-xl shadow-[0_.5rem_0_0_rgba(0,0,0,0.1)] mx-auto">
                <h1 className="text-4xl font-bold mb-4">Quiz Setup</h1>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="questionCount" className="text-lg">
                            Number of Questions
                        </Label>
                        <Input
                            type="number"
                            min={1}
                            id="questionCount"
                            value={quizSetup.questionCount}
                            onChange={handleQuestionChange}
                            max={selectedQuiz.questions?.length || 1}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="difficulty" className="text-lg">
                            Difficulty
                        </Label>

                        <Select
                            defaultValue="unspecified"
                            onValueChange={(value) =>
                                handleDifficultyChange(value)
                            }
                        >
                            <SelectTrigger id="difficulty">
                                <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unspecified">
                                    Unspecified
                                </SelectItem>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="w-full py-[4rem] flex items-center justify-center fixed bottom-0 left-0 bg-white border-t-2">
                <Button
                    variant={"blue"}
                    className="px-10 py-6 font-bold text-white text-xl rounded-xl"
                    onClick={startQuiz}
                >
                    <span className="flex items-center gap-2">
                        {play} Start
                    </span>
                </Button>
            </div>
        </div>
    );
}

export default page;
