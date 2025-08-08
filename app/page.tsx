"use client";

import { useEffect, useState } from "react";
import { IQuiz, IAssignment } from "@/types/types";
import QuizCard from "@/components/quiz/QuizCard";
import axios from "axios";
import Loader from "@/components/Loader";
import {
    CheckCircle,
    BookOpen,
    Timer,
    Trophy,
    Users,
    BarChart3,
    Target,
    Calendar,
    TrendingUp,
    Award,
    Clock,
    Brain,
    PlusCircle,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
    const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
    const [assignments, setAssignments] = useState<IAssignment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const {
        user,
        isTeacher,
        isAdmin,
        isStudent,
        loading: authLoading,
    } = useAuth();
    const router = useRouter();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!isStudent) return;
            try {
                const res = await axios.get("/api/user/assignments");
                setAssignments(res.data);
            } catch (e) {
                // ignore
            }
        };
        fetchAssignments();
    }, [isStudent]);

    const fetchQuizzes = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/api/quizzes");
            setQuizzes(response.data.slice(0, 6)); // Show only first 6 quizzes on home page
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        {
            title: "Quiz Management",
            description:
                "Create/Edit/Delete quizzes (title, topic, difficulty, time)",
            icon: <BookOpen className="w-8 h-8" />,
            color: "from-blue-500 to-blue-600",
        },
        {
            title: "Question Management",
            description:
                "Add/Edit/Delete questions (types: MCQ, True/False, Short Answer)",
            icon: <Brain className="w-8 h-8" />,
            color: "from-purple-500 to-purple-600",
        },
        {
            title: "Quiz Attempt Interface",
            description:
                "Randomized order, timer-enforced interface with answer inputs",
            icon: <Timer className="w-8 h-8" />,
            color: "from-green-500 to-green-600",
        },
        {
            title: "Auto Grading",
            description: "Real-time evaluation after submission",
            icon: <Award className="w-8 h-8" />,
            color: "from-yellow-500 to-yellow-600",
        },
        {
            title: "Answer Explanations",
            description: "View correct answer explanations post-submission",
            icon: <CheckCircle className="w-8 h-8" />,
            color: "from-indigo-500 to-indigo-600",
        },
        {
            title: "Question Bank",
            description:
                "Teachers can store reusable questions (private or shared)",
            icon: <Target className="w-8 h-8" />,
            color: "from-pink-500 to-pink-600",
        },
        {
            title: "Task Planner",
            description:
                "Create, categorize (study, work, personal), and track daily tasks",
            icon: <Calendar className="w-8 h-8" />,
            color: "from-teal-500 to-teal-600",
        },
        {
            title: "Dashboard (Role-Based)",
            description:
                "Students: upcoming quizzes/tasks, analytics. Teachers: quiz stats, top performers",
            icon: <BarChart3 className="w-8 h-8" />,
            color: "from-orange-500 to-orange-600",
        },
        {
            title: "Weekly Progress Report",
            description: "Reports on performance trends and task stats",
            icon: <TrendingUp className="w-8 h-8" />,
            color: "from-red-500 to-red-600",
        },
        {
            title: "Leaderboard & User Ranking",
            description: "User ranking and competitive progress tracking",
            icon: <Trophy className="w-8 h-8" />,
            color: "from-amber-500 to-amber-600",
        },
    ];

    const roles = [
        {
            title: "Students",
            description: "Take quizzes, manage daily tasks, track progress",
            icon: <Users className="w-6 h-6" />,
            features: [
                "Quiz attempts",
                "Task planning",
                "Progress analytics",
                "Leaderboard rankings",
            ],
        },
        {
            title: "Teachers",
            description:
                "Create quizzes, manage question banks, track student performance",
            icon: <Brain className="w-6 h-6" />,
            features: [
                "Quiz creation",
                "Question bank management",
                "Student analytics",
                "Performance tracking",
            ],
        },
        {
            title: "Administrators",
            description:
                "System management, user oversight, comprehensive analytics",
            icon: <Target className="w-6 h-6" />,
            features: [
                "User management",
                "System analytics",
                "Content oversight",
                "Platform administration",
            ],
        },
    ];

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Hero Section */}
            <section className="relative py-20 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full text-sm font-medium text-blue-700 mb-6">
                        <Calendar className="w-4 h-4" />
                        Daily Task Planner & Progress Tracker
                    </div>

                    <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                        Daily Task Planner
                    </h1>

                    <p className="text-xl text-gray-600 mb-4">
                        Online Progress App
                    </p>

                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Comprehensive platform for quiz management, task
                        planning, and progress tracking. Designed for students,
                        teachers, and administrators to enhance learning
                        outcomes.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {!authLoading && !user ? (
                            <>
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                    onClick={() => router.push("/register")}
                                >
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="px-8 py-3 rounded-lg font-semibold border-gray-300 hover:bg-gray-50"
                                    onClick={() => router.push("/quiz")}
                                >
                                    Explore Quizzes
                                </Button>
                            </>
                        ) : user ? (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-lg font-semibold"
                                    onClick={() => router.push("/tasks")}
                                >
                                    My Tasks
                                    <Calendar className="w-5 h-5 ml-2" />
                                </Button>
                                {!isAdmin && (
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold"
                                        onClick={() => router.push("/quiz")}
                                    >
                                        Take Quiz
                                        <BookOpen className="w-5 h-5 ml-2" />
                                    </Button>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Feature Categories
                        </h2>
                        <p className="text-xl text-gray-600">
                            Everything you need for effective learning and
                            progress tracking
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
                            >
                                <div
                                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center text-white mb-4`}
                                >
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Assigned to you */}
            {isStudent && assignments.length > 0 && (
                <section className="py-10 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold">
                                Assigned to you
                            </h2>
                            <Button
                                variant="outline"
                                onClick={() => router.push("/tasks")}
                            >
                                View tasks
                            </Button>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assignments.slice(0, 6).map((a) => (
                                <div
                                    key={a.id}
                                    className="bg-white rounded-xl shadow border p-5"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold text-gray-900">
                                            {a.quiz?.title || "Quiz"}
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                                            {a.status}
                                        </span>
                                    </div>
                                    {a.dueDate && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Due:{" "}
                                            {new Date(
                                                a.dueDate
                                            ).toLocaleDateString()}
                                        </div>
                                    )}
                                    <div className="mt-4">
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                router.push(
                                                    `/quiz/setup/${a.quizId}`
                                                )
                                            }
                                        >
                                            Start
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* User Roles Section */}
            <section className="py-20 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            User Roles & Auth System
                        </h2>
                        <p className="text-xl text-gray-600">
                            Tailored experiences for different user types
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {roles.map((role, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-lg p-8 text-center"
                            >
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                                    {role.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    {role.title}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {role.description}
                                </p>
                                <ul className="space-y-2 text-left">
                                    {role.features.map((feature, idx) => (
                                        <li
                                            key={idx}
                                            className="flex items-center gap-2 text-gray-700"
                                        >
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent Quizzes Section */}
            {quizzes.length > 0 && (
                <section id="featured" className="py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                    Featured Quizzes
                                </h2>
                                <p className="text-xl text-gray-600">
                                    Test your knowledge with our interactive
                                    quizzes
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="hidden md:flex items-center gap-2"
                                onClick={() => router.push("/quizzes")}
                            >
                                View All Quizzes
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {quizzes.map((quiz) => (
                                <QuizCard
                                    key={quiz.id}
                                    quiz={quiz}
                                    allowUnassigned={true}
                                />
                            ))}
                        </div>

                        <div className="text-center mt-8 md:hidden">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push("/quizzes")}
                            >
                                View All Quizzes
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            {!authLoading && !user && (
                <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
                    <div className="max-w-4xl mx-auto text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">
                            Ready to Start Your Progress Journey?
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            Join thousands of students and teachers already
                            using our platform to achieve their goals.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold"
                                onClick={() => router.push("/register")}
                            >
                                Sign Up Now
                                <PlusCircle className="w-5 h-5 ml-2" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-white bg-transparent text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold"
                                onClick={() => router.push("/login")}
                            >
                                Login
                            </Button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
