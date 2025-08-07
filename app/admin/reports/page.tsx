"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, BookOpen } from "lucide-react";
import Loader from "@/components/Loader";

interface ReportData {
    overview: {
        totalUsers: number;
        totalQuizzes: number;
        totalSubmissions: number;
        averageScore: number;
    };
    growth: {
        userGrowth: number;
        submissionGrowth: number;
    };
    distribution: {
        usersByRole: Array<{ role: string; count: number }>;
        submissionsByDay: Array<{ date: string; count: number }>;
    };
}

export default function AdminReportsPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState("30d");

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push("/");
            return;
        }

        if (isAdmin) {
            fetchReportData();
        }
    }, [isAdmin, loading, router, period]);

    const fetchReportData = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(
                `/api/admin/stats?period=${period}`
            );
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report data:", error);
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
                    <h1 className="text-3xl font-bold">System Reports</h1>
                    <p className="text-gray-600">
                        Comprehensive analytics and performance metrics
                    </p>
                </div>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {reportData && (
                <>
                    {/* Key Metrics */}
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
                                    {reportData.overview.totalUsers}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    +{reportData.growth.userGrowth.toFixed(1)}%
                                    growth
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
                                    {reportData.overview.totalQuizzes}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Platform content
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Submissions
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {reportData.overview.totalSubmissions}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    +
                                    {reportData.growth.submissionGrowth.toFixed(
                                        1
                                    )}
                                    % growth
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Average Score
                                </CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {reportData.overview.averageScore.toFixed(
                                        1
                                    )}
                                    %
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Platform performance
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* User Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>User Distribution by Role</CardTitle>
                            <CardDescription>
                                Breakdown of users across different roles
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {reportData.distribution.usersByRole.map(
                                    (roleData) => {
                                        const percentage = (
                                            (roleData.count /
                                                reportData.overview
                                                    .totalUsers) *
                                            100
                                        ).toFixed(1);
                                        const color =
                                            roleData.role === "admin"
                                                ? "purple"
                                                : roleData.role === "teacher"
                                                ? "green"
                                                : "blue";

                                        return (
                                            <div
                                                key={roleData.role}
                                                className="text-center"
                                            >
                                                <div
                                                    className={`w-20 h-20 rounded-full bg-${color}-100 flex items-center justify-center mx-auto mb-3`}
                                                >
                                                    <span
                                                        className={`text-2xl font-bold text-${color}-600`}
                                                    >
                                                        {roleData.count}
                                                    </span>
                                                </div>
                                                <h3 className="font-medium capitalize text-lg">
                                                    {roleData.role}s
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {percentage}% of total users
                                                </p>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Submission Activity</CardTitle>
                            <CardDescription>
                                Daily submission trends for the selected period
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {reportData.distribution.submissionsByDay
                                    .slice(0, 10)
                                    .map((dayData: any, index) => {
                                        const maxCount = Math.max(
                                            ...reportData.distribution.submissionsByDay.map(
                                                (d: any) => d.count
                                            )
                                        );
                                        const width =
                                            maxCount > 0
                                                ? (dayData.count / maxCount) *
                                                  100
                                                : 0;

                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-4"
                                            >
                                                <div className="w-24 text-sm text-gray-600">
                                                    {new Date(
                                                        dayData.date
                                                    ).toLocaleDateString()}
                                                </div>
                                                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                                                    <div
                                                        className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${width}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="w-12 text-sm font-medium text-right">
                                                    {dayData.count}
                                                </div>
                                            </div>
                                        );
                                    })}
                                {reportData.distribution.submissionsByDay
                                    .length === 0 && (
                                    <p className="text-gray-500 text-center py-8">
                                        No submission data available for this
                                        period
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Summary</CardTitle>
                            <CardDescription>
                                Key insights and recommendations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="font-medium text-green-700">
                                        ✅ Strengths
                                    </h4>
                                    <ul className="space-y-2 text-sm">
                                        <li>
                                            • Average quiz score:{" "}
                                            {reportData.overview.averageScore.toFixed(
                                                1
                                            )}
                                            %
                                        </li>
                                        <li>
                                            • User growth: +
                                            {reportData.growth.userGrowth.toFixed(
                                                1
                                            )}
                                            %
                                        </li>
                                        <li>
                                            • Submission growth: +
                                            {reportData.growth.submissionGrowth.toFixed(
                                                1
                                            )}
                                            %
                                        </li>
                                        <li>
                                            • Total platform engagement:{" "}
                                            {
                                                reportData.overview
                                                    .totalSubmissions
                                            }{" "}
                                            submissions
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-medium text-blue-700">
                                        📊 Insights
                                    </h4>
                                    <ul className="space-y-2 text-sm">
                                        <li>
                                            •{" "}
                                            {reportData.distribution.usersByRole.find(
                                                (r) => r.role === "student"
                                            )?.count || 0}{" "}
                                            students actively learning
                                        </li>
                                        <li>
                                            •{" "}
                                            {reportData.distribution.usersByRole.find(
                                                (r) => r.role === "teacher"
                                            )?.count || 0}{" "}
                                            teachers creating content
                                        </li>
                                        <li>
                                            • {reportData.overview.totalQuizzes}{" "}
                                            quizzes available on platform
                                        </li>
                                        <li>
                                            • Growing user engagement across all
                                            roles
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
