"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    XCircle,
    BookOpen,
    Users,
    Clock,
    BarChart3,
    AlertTriangle,
} from "lucide-react";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";

interface Quiz {
    id: string;
    title: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    creator: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    _count: {
        questions: number;
        submissions: number;
    };
    stats: {
        averageScore: number;
        minScore: number;
        maxScore: number;
    };
}

interface QuizListResponse {
    quizzes: Quiz[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export default function AdminQuizzesPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalQuizzes, setTotalQuizzes] = useState(0);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push("/");
            return;
        }

        if (isAdmin) {
            fetchQuizzes();
        }
    }, [isAdmin, loading, router, currentPage, searchTerm, statusFilter]);

    const fetchQuizzes = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "10",
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter && { status: statusFilter }),
            });

            const response = await axios.get<QuizListResponse>(
                `/api/admin/quizzes?${params}`
            );
            setQuizzes(response.data.quizzes);
            setTotalPages(response.data.pagination.pages);
            setTotalQuizzes(response.data.pagination.total);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            toast.error("Failed to fetch quizzes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value === "all" ? "" : value);
        setCurrentPage(1);
    };

    const handleEditQuiz = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setIsEditModalOpen(true);
    };

    const handleUpdateQuiz = async (
        quizId: string,
        updates: { title?: string; description?: string; isActive?: boolean }
    ) => {
        try {
            const response = await axios.put("/api/admin/quizzes", {
                quizId,
                ...updates,
            });
            setQuizzes(
                quizzes.map((quiz) =>
                    quiz.id === quizId ? { ...quiz, ...updates } : quiz
                )
            );
            toast.success("Quiz updated successfully");
            setIsEditModalOpen(false);
            setSelectedQuiz(null);
        } catch (error) {
            console.error("Error updating quiz:", error);
            toast.error("Failed to update quiz");
        }
    };

    const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
        if (
            !confirm(
                `Are you sure you want to delete "${quizTitle}"? This action cannot be undone and will delete all related submissions.`
            )
        ) {
            return;
        }

        try {
            await axios.delete("/api/admin/quizzes", {
                data: { quizId },
            });
            setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
            toast.success("Quiz deleted successfully");
        } catch (error) {
            console.error("Error deleting quiz:", error);
            toast.error("Failed to delete quiz");
        }
    };

    const toggleQuizStatus = async (quizId: string, currentStatus: boolean) => {
        await handleUpdateQuiz(quizId, { isActive: !currentStatus });
    };

    if (loading || isLoading) {
        return <Loader />;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Quiz Management</h1>
                    <p className="text-gray-600">
                        Monitor and moderate all quizzes across the platform
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Label htmlFor="search">Search Quizzes</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="search"
                                    placeholder="Search by title or description..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="w-48">
                            <Label htmlFor="status">Filter by Status</Label>
                            <Select
                                value={statusFilter || "all"}
                                onValueChange={handleStatusFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All statuses
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quiz Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-sm text-gray-600">
                                    Total Quizzes
                                </p>
                                <p className="text-2xl font-bold">
                                    {totalQuizzes}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-2xl font-bold">
                                    {quizzes.filter((q) => q.isActive).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-500" />
                            <div>
                                <p className="text-sm text-gray-600">
                                    Inactive
                                </p>
                                <p className="text-2xl font-bold">
                                    {quizzes.filter((q) => !q.isActive).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-500" />
                            <div>
                                <p className="text-sm text-gray-600">
                                    Total Submissions
                                </p>
                                <p className="text-2xl font-bold">
                                    {quizzes.reduce(
                                        (acc, quiz) =>
                                            acc + quiz._count.submissions,
                                        0
                                    )}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quizzes List */}
            <Card>
                <CardHeader>
                    <CardTitle>Quizzes ({totalQuizzes})</CardTitle>
                    <CardDescription>
                        Showing {quizzes.length} of {totalQuizzes} quizzes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {quizzes.map((quiz) => (
                            <div
                                key={quiz.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-medium text-lg">
                                            {quiz.title}
                                        </h3>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                quiz.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {quiz.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                        {quiz._count.submissions === 0 && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                <AlertTriangle className="w-3 h-3 mr-1" />
                                                No submissions
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">
                                        {quiz.description}
                                    </p>
                                    <div className="flex items-center gap-6 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            Created by{" "}
                                            {quiz.creator?.name || "Unknown"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4" />
                                            {quiz._count.questions} questions
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <BarChart3 className="w-4 h-4" />
                                            {quiz._count.submissions}{" "}
                                            submissions
                                        </span>
                                        {quiz._count.submissions > 0 && (
                                            <span className="flex items-center gap-1">
                                                <CheckCircle className="w-4 h-4" />
                                                Avg:{" "}
                                                {quiz.stats.averageScore.toFixed(
                                                    1
                                                )}
                                                %
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                                        <span>
                                            Created:{" "}
                                            {new Date(
                                                quiz.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                        <span>
                                            Updated:{" "}
                                            {new Date(
                                                quiz.updatedAt
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
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
                                        {quiz.isActive ? (
                                            <>
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Activate
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditQuiz(quiz)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handleDeleteQuiz(
                                                quiz.id,
                                                quiz.title
                                            )
                                        }
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {quizzes.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">
                                    No quizzes found
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-4 text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage(
                                        Math.min(totalPages, currentPage + 1)
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Quiz Modal */}
            {isEditModalOpen && selectedQuiz && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Edit Quiz</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                    id="edit-title"
                                    defaultValue={selectedQuiz.title}
                                    onChange={(e) =>
                                        setSelectedQuiz({
                                            ...selectedQuiz,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-description">
                                    Description
                                </Label>
                                <Input
                                    id="edit-description"
                                    defaultValue={selectedQuiz.description}
                                    onChange={(e) =>
                                        setSelectedQuiz({
                                            ...selectedQuiz,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="edit-active"
                                    checked={selectedQuiz.isActive}
                                    onChange={(e) =>
                                        setSelectedQuiz({
                                            ...selectedQuiz,
                                            isActive: e.target.checked,
                                        })
                                    }
                                />
                                <Label htmlFor="edit-active">Active</Label>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <Button
                                onClick={() =>
                                    handleUpdateQuiz(selectedQuiz.id, {
                                        title: selectedQuiz.title,
                                        description: selectedQuiz.description,
                                        isActive: selectedQuiz.isActive,
                                    })
                                }
                                className="flex-1"
                            >
                                Save Changes
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setSelectedQuiz(null);
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
