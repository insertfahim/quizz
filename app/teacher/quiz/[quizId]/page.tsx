"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    Edit,
    Users,
    Clock,
    Calendar,
    BarChart3,
    CheckCircle,
    XCircle,
    TrendingUp,
} from "lucide-react";
import Loader from "@/components/Loader";

interface QuizDetails {
    id: string;
    title: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    timeLimit?: number;
    creator: {
        name: string;
        email: string;
    };
    questions: Array<{
        id: string;
        text: string;
        type: string;
        difficulty: string;
        options: Array<{
            id: string;
            text: string;
            isCorrect: boolean;
        }>;
    }>;
    submissions: Array<{
        id: string;
        score: number;
        totalQuestions: number;
        correctAnswers: number;
        timeSpent?: number;
        submittedAt: string;
        user: {
            name: string;
            email: string;
        };
    }>;
    _count: {
        questions: number;
        submissions: number;
    };
}

export default function QuizDetailsPage() {
    const { isTeacher, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const quizId = params.quizId as string;

    const [quiz, setQuiz] = useState<QuizDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !isTeacher) {
            router.push("/");
            return;
        }

        if (isTeacher && quizId) {
            fetchQuizDetails();
        }
    }, [isTeacher, loading, router, quizId]);

    const fetchQuizDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/teacher/quizzes/${quizId}`);
            setQuiz(response.data);
        } catch (error) {
            console.error("Error fetching quiz details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleQuizStatus = async () => {
        if (!quiz) return;

        try {
            await axios.put(`/api/teacher/quizzes/${quizId}`, {
                isActive: !quiz.isActive,
            });

            setQuiz({ ...quiz, isActive: !quiz.isActive });
        } catch (error) {
            console.error("Error updating quiz status:", error);
        }
    };

    if (loading || isLoading) {
        return <Loader />;
    }

    if (!isTeacher || !quiz) {
        return null;
    }

    const averageScore =
        quiz.submissions.length > 0
            ? quiz.submissions.reduce((sum, s) => sum + s.score, 0) /
              quiz.submissions.length
            : 0;

    const averageTime =
        quiz.submissions.length > 0
            ? quiz.submissions
                  .filter((s) => s.timeSpent)
                  .reduce((sum, s) => sum + (s.timeSpent || 0), 0) /
              quiz.submissions.filter((s) => s.timeSpent).length
            : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/teacher/quizzes">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Quizzes
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{quiz.title}</h1>
                    <p className="text-gray-600">
                        {quiz.description || "No description provided"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/teacher/quiz/${quizId}/edit`}>
                        <Button variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Quiz
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        onClick={toggleQuizStatus}
                        className={
                            quiz.isActive
                                ? "text-red-600 hover:text-red-700"
                                : "text-green-600 hover:text-green-700"
                        }
                    >
                        {quiz.isActive ? (
                            <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Quiz Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Quiz Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {quiz._count.questions}
                            </div>
                            <div className="text-sm text-gray-600">
                                Questions
                            </div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {quiz._count.submissions}
                            </div>
                            <div className="text-sm text-gray-600">
                                Submissions
                            </div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {averageScore.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">
                                Average Score
                            </div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                                {averageTime > 0
                                    ? `${Math.round(averageTime / 60)}m`
                                    : "N/A"}
                            </div>
                            <div className="text-sm text-gray-600">
                                Average Time
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Description:</span>
                            <p className="mt-1 text-gray-600">
                                {quiz.description || "No description provided"}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium">Time Limit:</span>
                            <p className="mt-1 text-gray-600">
                                {quiz.timeLimit
                                    ? `${quiz.timeLimit} minutes`
                                    : "No time limit"}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium">Status:</span>
                            <p className="mt-1">
                                <span
                                    className={`inline-flex items-center gap-1 ${
                                        quiz.isActive
                                            ? "text-green-600"
                                            : "text-gray-600"
                                    }`}
                                >
                                    {quiz.isActive ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <XCircle className="w-4 h-4" />
                                    )}
                                    {quiz.isActive ? "Active" : "Inactive"}
                                </span>
                            </p>
                        </div>
                        <div>
                            <span className="font-medium">Created:</span>
                            <p className="mt-1 text-gray-600">
                                {new Date(quiz.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Questions */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Questions ({quiz.questions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {quiz.questions.map((question, index) => (
                                <div
                                    key={question.id}
                                    className="border rounded-lg p-4"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium">
                                            Question {index + 1}
                                        </h4>
                                        <span
                                            className={`text-xs px-2 py-1 rounded ${
                                                question.difficulty === "easy"
                                                    ? "bg-green-100 text-green-800"
                                                    : question.difficulty ===
                                                      "medium"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {question.difficulty}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">
                                        {question.text}
                                    </p>
                                    <div className="text-xs text-gray-500">
                                        Type: {question.type.replace("_", " ")}{" "}
                                        • {question.options.length} options
                                    </div>
                                </div>
                            ))}
                            {quiz.questions.length === 0 && (
                                <p className="text-gray-500 text-center py-4">
                                    No questions added yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Submissions */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Recent Submissions ({quiz.submissions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {quiz.submissions.slice(0, 10).map((submission) => (
                                <div
                                    key={submission.id}
                                    className="border rounded-lg p-3"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-medium text-sm">
                                                {submission.user.name}
                                            </h4>
                                            <p className="text-xs text-gray-600">
                                                {submission.user.email}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                {submission.score.toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {submission.correctAnswers}/
                                                {submission.totalQuestions}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>
                                            {new Date(
                                                submission.submittedAt
                                            ).toLocaleDateString()}
                                        </span>
                                        {submission.timeSpent && (
                                            <span>
                                                {Math.round(
                                                    submission.timeSpent / 60
                                                )}{" "}
                                                minutes
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {quiz.submissions.length === 0 && (
                                <p className="text-gray-500 text-center py-4">
                                    No submissions yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
