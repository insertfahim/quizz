"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Plus,
    Edit,
    Eye,
    MoreVertical,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    BookOpen,
} from "lucide-react";
import Loader from "@/components/Loader";

interface Quiz {
    id: string;
    title: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    timeLimit?: number;
    _count: {
        questions: number;
        submissions: number;
    };
}

export default function TeacherQuizzesPage() {
    const { isTeacher, loading } = useAuth();
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !isTeacher) {
            router.push("/");
            return;
        }

        if (isTeacher) {
            fetchQuizzes();
        }
    }, [isTeacher, loading, router]);

    const fetchQuizzes = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/api/teacher/quizzes");
            setQuizzes(response.data);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleQuizStatus = async (quizId: string, currentStatus: boolean) => {
        try {
            await axios.put(`/api/teacher/quizzes/${quizId}`, {
                isActive: !currentStatus,
            });

            // Update local state
            setQuizzes((prevQuizzes) =>
                prevQuizzes.map((quiz) =>
                    quiz.id === quizId
                        ? { ...quiz, isActive: !currentStatus }
                        : quiz
                )
            );
        } catch (error) {
            console.error("Error updating quiz status:", error);
        }
    };

    if (loading || isLoading) {
        return <Loader />;
    }

    if (!isTeacher) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">My Quizzes</h1>
                    <p className="text-gray-600">
                        Manage all your created quizzes
                    </p>
                </div>
                <Link href="/teacher/quiz/create">
                    <Button className="bg-blue-500 hover:bg-blue-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Quiz
                    </Button>
                </Link>
            </div>

            {/* Quiz Grid */}
            {quizzes.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <BookOpen className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No quizzes created yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Start by creating your first quiz for students
                        </p>
                        <Link href="/teacher/quiz/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Quiz
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <Card
                            key={quiz.id}
                            className="hover:shadow-lg transition-shadow"
                        >
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg line-clamp-2">
                                            {quiz.title}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {quiz.description ||
                                                "No description"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {quiz.isActive ? (
                                            <CheckCircle
                                                className="w-5 h-5 text-green-500"
                                                aria-label="Active"
                                            />
                                        ) : (
                                            <XCircle
                                                className="w-5 h-5 text-gray-400"
                                                aria-label="Inactive"
                                            />
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-3">
                                    {quiz.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {quiz.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            <span>
                                                {quiz._count.questions}{" "}
                                                questions
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>
                                                {quiz._count.submissions}{" "}
                                                submissions
                                            </span>
                                        </div>
                                    </div>

                                    {quiz.timeLimit && (
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Clock className="w-4 h-4" />
                                            <span>
                                                {quiz.timeLimit} minutes
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-400">
                                        Created on{" "}
                                        {new Date(
                                            quiz.createdAt
                                        ).toLocaleDateString()}
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Link
                                            href={`/teacher/quiz/${quiz.id}`}
                                            className="flex-1"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                        </Link>
                                        <Link
                                            href={`/teacher/quiz/${quiz.id}/edit`}
                                            className="flex-1"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                toggleQuizStatus(
                                                    quiz.id,
                                                    quiz.isActive
                                                )
                                            }
                                            className={
                                                quiz.isActive
                                                    ? "text-red-600 hover:text-red-700"
                                                    : "text-green-600 hover:text-green-700"
                                            }
                                        >
                                            {quiz.isActive
                                                ? "Deactivate"
                                                : "Activate"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
