"use client";
import { Button } from "@/components/ui/button";
import { IOption, IQuestion, IResponse } from "@/types/types";
import { flag, next } from "@/utils/Icons";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

function page() {
    const router = useRouter();
    const {
        user,
        isAdmin,
        isTeacher,
        isStudent,
        loading: authLoading,
    } = useAuth();
    const gateInitialized = useRef(false);

    // Local state management
    const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
    const [quizSetup, setQuizSetup] = useState<any>(null);
    const [filteredQuestions, setFilteredQuestions] = useState<IQuestion[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeQuestion, setActiveQuestion] = useState(null) as any;
    const [responses, setResponses] = useState<IResponse[]>([]);
    const [shuffledOptions, setShuffledOptions] = useState<IOption[]>([]);
    const [shuffledQuestions, setShuffledQuestions] = useState<IQuestion[]>([]);

    useEffect(() => {
        // Guard against double invocation in React Strict Mode
        if (gateInitialized.current) return;
        if (authLoading) return; // wait for auth to resolve

        const run = async () => {
            // Block non-students early and consistently
            if (isTeacher || isAdmin) {
                const onceKey = "quizAccessToastShown";
                const shown = sessionStorage.getItem(onceKey);
                if (!shown) {
                    toast.error(
                        isTeacher
                            ? "Teachers cannot take quizzes."
                            : "Admins cannot take quizzes."
                    );
                    sessionStorage.setItem(onceKey, "1");
                }
                clearSessionAndRedirect();
                return;
            }

            // Load quiz data from localStorage
            const storedQuiz = localStorage.getItem("selectedQuiz");
            const storedQuizSetup = localStorage.getItem("quizSetup");
            const storedFilteredQuestions =
                localStorage.getItem("filteredQuestions");

            if (!storedQuiz || !storedQuizSetup || !storedFilteredQuestions) {
                if (user) {
                    const onceKey = "quizAccessToastShown";
                    const shown = sessionStorage.getItem(onceKey);
                    if (!shown) {
                        toast.error(
                            "Quiz session not found. Please start from quiz setup."
                        );
                        sessionStorage.setItem(onceKey, "1");
                    }
                }
                router.push("/");
                return;
            }

            let quiz: any;
            let setup: any;
            let questions: IQuestion[];
            try {
                quiz = JSON.parse(storedQuiz);
                setup = JSON.parse(storedQuizSetup);
                questions = JSON.parse(storedFilteredQuestions);
            } catch (error) {
                console.error("Error parsing quiz data:", error);
                toast.error("Invalid quiz data. Please restart the quiz.");
                router.push("/");
                return;
            }

            // Require a signed-in student with an active assignment for this quiz
            if (!user || !isStudent) {
                // Prevent duplicate toasts by gating on a one-time flag per mount
                const onceKey = "quizAccessToastShown";
                const shown = sessionStorage.getItem(onceKey);
                if (!shown) {
                    toast.error(
                        "Please sign in as a student to take assigned quizzes."
                    );
                    sessionStorage.setItem(onceKey, "1");
                }
                clearSessionAndRedirect();
                return;
            }

            // Assignment logic removed – any signed-in student can take quizzes

            setSelectedQuiz(quiz);
            setQuizSetup(setup);
            setFilteredQuestions(questions);
            setLoading(false);
            gateInitialized.current = true;
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, user, authLoading, isTeacher, isAdmin, isStudent]);

    const clearSessionAndRedirect = () => {
        try {
            localStorage.removeItem("selectedQuiz");
            localStorage.removeItem("quizSetup");
            localStorage.removeItem("filteredQuestions");
            localStorage.removeItem("allowUnassignedQuizStart");
        } catch (_) {}
        router.push("/");
    };

    // Access verification moved into the single guarded effect above

    // Fisher-Yates Shuffle Algorithm - moved before hooks
    const shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; --i) {
            // generate a random index between 0 and i
            const j = Math.floor(Math.random() * (i + 1));

            // swap elements --> destructuring assignment
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    };

    // shuffle questions when the quiz is started
    useEffect(() => {
        if (!filteredQuestions.length || !quizSetup) return;

        const allQuestions = filteredQuestions.slice(
            0,
            quizSetup.questionCount
        );
        setShuffledQuestions(shuffleArray([...allQuestions]));
    }, [filteredQuestions, quizSetup]);

    // shuffle options when the active question changes
    useEffect(() => {
        if (shuffledQuestions[currentIndex]) {
            // shuffle options for the current question
            setShuffledOptions(
                shuffleArray([...shuffledQuestions[currentIndex].options])
            );
        }
    }, [shuffledQuestions, currentIndex]);

    // Admin access is handled in the guarded effect

    // Conditional returns AFTER all hooks
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-600">
                        Access Restricted
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Admins are not allowed to take quizzes.
                    </p>
                </div>
            </div>
        );
    }

    if (!selectedQuiz || !quizSetup || !filteredQuestions.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-600">
                        No Quiz Found
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Please start from the quiz setup page.
                    </p>
                    <Button className="mt-4" onClick={() => router.push("/")}>
                        Go to Home
                    </Button>
                </div>
            </div>
        );
    }

    const handleActiveQuestion = (option: any) => {
        if (!shuffledQuestions[currentIndex]) return;

        const response = {
            questionId: shuffledQuestions[currentIndex].id,
            optionId: option.id,
            isCorrect: option.isCorrect,
        };

        setResponses((prev) => {
            // check if the response already exists
            const existingIndex = prev.findIndex((res) => {
                return res.questionId === response.questionId;
            });

            // update the response if it exists

            if (existingIndex !== -1) {
                // update the response
                const updatedResponses = [...prev];
                updatedResponses[existingIndex] = response;

                return updatedResponses;
            } else {
                return [...prev, response];
            }
        });

        // set the active question
        setActiveQuestion(option);
    };

    const handleNextQuestion = () => {
        if (currentIndex < shuffledQuestions.length - 1) {
            setCurrentIndex((prev) => prev + 1);

            // reset the active question
            setActiveQuestion(null);
        } else {
            router.push("/results");
        }
    };

    const handleFinishQuiz = async () => {
        // Store quiz responses in localStorage for results page
        localStorage.setItem("quizResponses", JSON.stringify(responses));

        const total = responses.length;
        const correct = responses.filter((res) => res.isCorrect).length;
        const score = total > 0 ? (correct / total) * 100 : 0;

        try {
            // Assignment logic removed – if user exists, save result
            if (user) {
                const res = await axios.post("/api/user/quiz/finish", {
                    quizId: selectedQuiz.id,
                    score,
                    responses,
                });
                console.log("Quiz finished:", res.data);
            } else {
                toast("Results not saved. Sign in to track your progress.");
            }
        } catch (error) {
            console.log("Error finishing quiz:", error);
            toast.error("Failed to save results. They won't be stored.");
        }

        router.push("/results");
    };

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-[2.5rem]">
            {shuffledQuestions[currentIndex] ? (
                <div className="space-y-6">
                    <div className="flex flex-col gap-6">
                        <p className="py-3 px-6 border-2 text-xl font-bold self-end rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
                            Question: <span>{currentIndex + 1}</span> /{" "}
                            <span className="text-3xl">
                                {shuffledQuestions.length}
                            </span>
                        </p>
                        <h1 className="mt-4 px-10 text-5xl font-bold text-center">
                            {shuffledQuestions[currentIndex].text}
                        </h1>
                    </div>

                    <div className="pt-14 space-y-4">
                        {shuffledOptions.map((option, index) => (
                            <button
                                key={index}
                                className={`relative group py-3 w-full text-center border-2 text-lg font-semibold rounded-lg
                    hover:bg-[rgba(0,0,0,0.03)] transition-all duration-200 ease-in-out
                ${
                    option.text === activeQuestion?.text
                        ? "bg-green-100 border-green-500 shadow-[0_.3rem_0_0_#51bf22] hover:bg-green-100 hover:border-green-500"
                        : "shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]"
                }
                    `}
                                onClick={() =>
                                    handleActiveQuestion(option as IOption)
                                }
                            >
                                {option.text}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-lg">No questions found for this quiz</p>
            )}

            <div className="w-full py-[4rem] fixed bottom-0 left-0 border-t-2 flex items-center justify-center">
                <Button
                    className="px-10 py-6 font-bold text-white text-xl rounded-xl"
                    variant={"green"}
                    onClick={() => {
                        if (currentIndex < shuffledQuestions.length - 1) {
                            if (activeQuestion?.id) {
                                handleNextQuestion();
                            } else {
                                const sound = new Audio("/sounds/error.mp3");
                                sound.play();
                                toast.error(
                                    "Please select an option to continue"
                                );
                            }
                        } else {
                            if (activeQuestion?.id) {
                                handleFinishQuiz();
                            } else {
                                const sound = new Audio("/sounds/error.mp3");
                                sound.play();
                                toast.error(
                                    "Please select an option to continue"
                                );
                            }
                        }
                    }}
                >
                    {currentIndex < shuffledQuestions.length - 1 ? (
                        <span className="flex items-center gap-2">
                            {next} Next
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            {flag} Finish
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
}

export default page;
