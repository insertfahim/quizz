"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import axios from "axios";
import Loader from "@/components/Loader";

interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    email: string;
    totalScore: number;
    quizzesCompleted: number;
    averageScore: number;
    categoryScores?: {
        category: string;
        averageScore: number;
        attempts: number;
    }[];
}

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetchLeaderboard();
    }, [timeFilter, categoryFilter]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/leaderboard", {
                params: {
                    timeFilter,
                    categoryFilter,
                },
            });
            setLeaderboard(response.data.leaderboard);
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-6 h-6 text-yellow-500" />;
            case 2:
                return <Medal className="w-6 h-6 text-gray-400" />;
            case 3:
                return <Award className="w-6 h-6 text-orange-600" />;
            default:
                return (
                    <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-600">
                        {rank}
                    </span>
                );
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300";
            case 2:
                return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300";
            case 3:
                return "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300";
            default:
                return "";
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
                <p className="text-gray-600">
                    See how you rank against other quiz takers
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-4 justify-center flex-wrap">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Top 3 Podium */}
            {leaderboard.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {leaderboard.slice(0, 3).map((entry) => (
                        <Card
                            key={entry.userId}
                            className={`p-6 text-center ${getRankColor(
                                entry.rank
                            )} border-2`}
                        >
                            <div className="flex justify-center mb-4">
                                {getRankIcon(entry.rank)}
                            </div>
                            <h3 className="font-bold text-lg mb-1">
                                {entry.name || "Anonymous"}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                {entry.email}
                            </p>
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-blue-600">
                                    {entry.averageScore.toFixed(1)}%
                                </p>
                                <p className="text-sm text-gray-600">
                                    {entry.quizzesCompleted} quizzes
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Full Leaderboard Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Average Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quizzes
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Points
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trend
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leaderboard.map((entry, index) => (
                                <tr
                                    key={entry.userId}
                                    className={`${
                                        index < 3 ? "bg-opacity-50" : ""
                                    } hover:bg-gray-50 transition-colors`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getRankIcon(entry.rank)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {entry.name || "Anonymous"}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {entry.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-blue-600">
                                            {entry.averageScore.toFixed(1)}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {entry.quizzesCompleted}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {entry.totalScore.toFixed(0)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {leaderboard.length === 0 && (
                <Card className="p-8 text-center">
                    <p className="text-gray-500">
                        No leaderboard data available yet. Complete some quizzes
                        to appear here!
                    </p>
                </Card>
            )}
        </div>
    );
}
