"use client";
import { useUser } from "@clerk/nextjs";
import React from "react";
import Loader from "./Loader";
import Image from "next/image";
import { formatTime } from "@/utils/formatTime";
import { checkAbc, crosshairs } from "@/utils/Icons";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";

interface QuizSubmission {
    id: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    submittedAt: string | Date;
    quiz: {
        title: string;
    };
}

interface UserStatsProps {
    userStats: {
        submissions: QuizSubmission[];
    } | null;
}

function UserStats({ userStats }: UserStatsProps) {
    const { user, isLoaded } = useUser();

    if (!isLoaded) {
        return <Loader />;
    }

    // Handle case where userStats is null or undefined
    if (
        !userStats ||
        !userStats.submissions ||
        userStats.submissions.length === 0
    ) {
        return (
            <div className="flex flex-col gap-4">
                <div className="h-[15rem] px-8 flex items-center justify-center border-2 rounded-xl shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
                    <Image
                        src={user?.imageUrl || "/user.png"}
                        alt="Profile Image"
                        width={200}
                        height={200}
                        className="rounded-full border-2 shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]"
                    />
                </div>
                <div className="mt-4">
                    <h1 className="font-bold text-2xl">Overview</h1>
                    <p className="text-muted-foreground">
                        No statistics available yet. Complete some quizzes to
                        see your stats!
                    </p>
                </div>
            </div>
        );
    }

    // Calculate stats from submissions
    const submissions = userStats.submissions;
    const totalAttempts = submissions.length;
    const averageScore =
        submissions.reduce((acc, submission) => acc + submission.score, 0) /
        totalAttempts;
    const recentAttemptDate = new Date(
        Math.max(...submissions.map((s) => new Date(s.submittedAt).getTime()))
    );

    // Get latest submissions (up to 5)
    const latestSubmissions = submissions
        .sort(
            (a, b) =>
                new Date(b.submittedAt).getTime() -
                new Date(a.submittedAt).getTime()
        )
        .slice(0, 5);

    return (
        <div className="flex flex-col gap-4">
            <div className="h-[15rem] px-8 flex items-center justify-center border-2 rounded-xl shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
                <Image
                    src={user?.imageUrl || "/user.png"}
                    alt="Profile Image"
                    width={200}
                    height={200}
                    className="rounded-full border-2 shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]"
                />
            </div>

            <div className="mt-4">
                <h1 className="font-bold text-2xl">Overview</h1>
                <p className="text-muted-foreground">
                    A summary of your recent quiz activity and performance
                </p>
            </div>

            <div className="grid grid-cols-3 gap-6 font-semibold">
                <div className="py-4 px-4 flex flex-col gap-1 border-2 rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
                    <h2 className="font-bold text-xl">{user?.firstName}</h2>
                    <p className="text-gray-400 font-semibold">
                        Recent Attempt
                    </p>
                    <p className="text-sm text-gray-400 font-semibold">
                        {formatTime(recentAttemptDate)}
                    </p>
                </div>

                <div className="py-4 px-4 flex gap-2 border-2 rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
                    <div className="text-2xl text-blue-400">{crosshairs}</div>
                    <div>
                        <p className="font-bold">Total Attempts</p>
                        <p className="mt-2 font-bold text-3xl">
                            {totalAttempts}
                        </p>
                    </div>
                </div>

                <div className="py-4 px-4 flex gap-2 border-2 rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
                    <div className="text-2xl text-blue-400">{checkAbc}</div>
                    <div>
                        <p className="font-bold">Average Score</p>
                        <p className="mt-2 font-bold text-3xl">
                            {averageScore.toFixed(1)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <h1 className="font-bold text-2xl">Recent Quiz Attempts</h1>
                <p className="text-muted-foreground">
                    Your latest quiz submissions
                </p>
            </div>

            <div className="border-2 rounded-lg shadow-[0_.3rem_0_0_rgba(0,0,0,0.1)]">
                <Table>
                    <TableHeader className="text-base font-semibold">
                        <TableRow>
                            <TableHead className="py-4">Quiz</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead>Correct</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {latestSubmissions.map((submission) => (
                            <TableRow key={submission.id}>
                                <TableCell className="font-semibold py-4">
                                    {submission.quiz.title}
                                </TableCell>
                                <TableCell>
                                    {submission.score.toFixed(1)}
                                </TableCell>
                                <TableCell>
                                    {submission.totalQuestions}
                                </TableCell>
                                <TableCell>
                                    {submission.correctAnswers}
                                </TableCell>
                                <TableCell>
                                    {formatTime(
                                        new Date(submission.submittedAt)
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default UserStats;
