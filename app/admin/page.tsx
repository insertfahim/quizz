"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Users,
    BookOpen,
    TrendingUp,
    Shield,
    Activity,
    BarChart3,
    Settings,
    UserCheck,
    AlertTriangle,
    Clock,
    CheckCircle,
    XCircle,
} from "lucide-react";
import Loader from "@/components/Loader";

interface AdminStats {
    overview: {
        totalUsers: number;
        totalStudents: number;
        totalTeachers: number;
        totalAdmins: number;
        activeUsers: number;
        totalQuizzes: number;
        activeQuizzes: number;
        totalSubmissions: number;
        totalTasks: number;
        completedTasks: number;
        totalQuestions: number;
        averageScore: number;
    };
    growth: {
        userGrowth: number;
        submissionGrowth: number;
    };
    recentActivity: {
        recentUsers: Array<{
            id: string;
            name: string;
            email: string;
            role: string;
            createdAt: string;
        }>;
        recentSubmissions: Array<{
            id: string;
            score: number;
            submittedAt: string;
            user: {
                name: string;
                email: string;
            };
            quiz: {
                title: string;
            };
        }>;
    };
    popular: {
        quizzes: Array<{
            id: string;
            title: string;
            creator: {
                name: string;
            };
            _count: {
                submissions: number;
                questions: number;
            };
        }>;
    };
}

export default function AdminDashboard() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState("7d");

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push("/");
            return;
        }

        if (isAdmin) {
            fetchDashboardData();
        }
    }, [isAdmin, loading, router, period]);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(
                `/api/admin/stats?period=${period}`
            );
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching admin dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
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
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-gray-600">
                        System overview and management tools
                    </p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-3 py-2 border rounded-md bg-white"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>
                    <Link href="/admin/users">
                        <Button variant="outline">
                            <Users className="w-4 h-4 mr-2" />
                            Manage Users
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Key Metrics */}
            {stats && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Users
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.overview.totalUsers}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    +{stats.growth.userGrowth.toFixed(1)}% from
                                    last period
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Users
                                </CardTitle>
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.overview.activeUsers}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {(
                                        (stats.overview.activeUsers /
                                            stats.overview.totalUsers) *
                                        100
                                    ).toFixed(1)}
                                    % of total
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Quizzes
                                </CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.overview.totalQuizzes}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.overview.activeQuizzes} active
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Submissions
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.overview.totalSubmissions}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    +{stats.growth.submissionGrowth.toFixed(1)}%
                                    from last period
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Role Distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    Students
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-600">
                                    {stats.overview.totalStudents}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {(
                                        (stats.overview.totalStudents /
                                            stats.overview.totalUsers) *
                                        100
                                    ).toFixed(1)}
                                    % of users
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-green-500" />
                                    Teachers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">
                                    {stats.overview.totalTeachers}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {(
                                        (stats.overview.totalTeachers /
                                            stats.overview.totalUsers) *
                                        100
                                    ).toFixed(1)}
                                    % of users
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-purple-500" />
                                    Admins
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-purple-600">
                                    {stats.overview.totalAdmins}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {(
                                        (stats.overview.totalAdmins /
                                            stats.overview.totalUsers) *
                                        100
                                    ).toFixed(1)}
                                    % of users
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Users */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Users</CardTitle>
                                <CardDescription>
                                    New users registered in the last {period}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {stats.recentActivity.recentUsers
                                        .slice(0, 5)
                                        .map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div>
                                                    <h3 className="font-medium">
                                                        {user.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            user.role ===
                                                            "admin"
                                                                ? "bg-purple-100 text-purple-800"
                                                                : user.role ===
                                                                  "teacher"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-blue-100 text-blue-800"
                                                        }`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(
                                                            user.createdAt
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    {stats.recentActivity.recentUsers.length ===
                                        0 && (
                                        <p className="text-gray-500 text-center py-4">
                                            No new users in this period
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Popular Quizzes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Popular Quizzes</CardTitle>
                                <CardDescription>
                                    Most attempted quizzes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {stats.popular.quizzes
                                        .slice(0, 5)
                                        .map((quiz) => (
                                            <div
                                                key={quiz.id}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div>
                                                    <h3 className="font-medium">
                                                        {quiz.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        by {quiz.creator.name}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {
                                                            quiz._count
                                                                .submissions
                                                        }{" "}
                                                        attempts
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {quiz._count.questions}{" "}
                                                        questions
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* System Health */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Health</CardTitle>
                            <CardDescription>
                                Key performance indicators
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Average Score
                                        </p>
                                        <p className="text-lg font-bold">
                                            {stats.overview.averageScore.toFixed(
                                                1
                                            )}
                                            %
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="h-8 w-8 text-blue-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Total Tasks
                                        </p>
                                        <p className="text-lg font-bold">
                                            {stats.overview.totalTasks}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Completed Tasks
                                        </p>
                                        <p className="text-lg font-bold">
                                            {stats.overview.completedTasks}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-8 w-8 text-purple-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Total Questions
                                        </p>
                                        <p className="text-lg font-bold">
                                            {stats.overview.totalQuestions}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common administrative tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link href="/admin/users">
                                    <Button
                                        variant="outline"
                                        className="w-full h-16"
                                    >
                                        <Users className="w-5 h-5 mr-2" />
                                        Manage Users
                                    </Button>
                                </Link>
                                <Link href="/admin/quizzes">
                                    <Button
                                        variant="outline"
                                        className="w-full h-16"
                                    >
                                        <BookOpen className="w-5 h-5 mr-2" />
                                        Manage Quizzes
                                    </Button>
                                </Link>
                                <Link href="/admin/reports">
                                    <Button
                                        variant="outline"
                                        className="w-full h-16"
                                    >
                                        <BarChart3 className="w-5 h-5 mr-2" />
                                        View Reports
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
