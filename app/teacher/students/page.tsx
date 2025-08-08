"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface StudentRow {
    id: string;
    name: string | null;
    email: string;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    _count: {
        submissions: number;
    };
}

export default function TeacherStudentsPage() {
    const { isTeacher, loading } = useAuth();
    const router = useRouter();

    const [students, setStudents] = useState<StudentRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!loading && !isTeacher) {
            router.push("/");
            return;
        }
        if (isTeacher) {
            fetchStudents();
        }
    }, [isTeacher, loading, router]);

    const fetchStudents = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get("/api/teacher/students");
            setStudents(res.data);
        } catch (e) {
            // no-op
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = students.filter((s) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            (s.name || "").toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
        );
    });

    if (loading || isLoading) {
        return <Loader />;
    }

    if (!isTeacher) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Students</h1>
                    <p className="text-gray-600">All registered students</p>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search by name or email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                    />
                    <Button variant="outline" onClick={fetchStudents}>
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border p-4">
                {filtered.length === 0 ? (
                    <div className="text-gray-500 text-center py-12">
                        No students found
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Submissions</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-medium">
                                        {s.name || "—"}
                                    </TableCell>
                                    <TableCell>{s.email}</TableCell>
                                    <TableCell>
                                        {s._count.submissions}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                        {s.lastLoginAt
                                            ? new Date(
                                                  s.lastLoginAt
                                              ).toLocaleString()
                                            : "Never"}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={
                                                s.isActive
                                                    ? "text-green-600"
                                                    : "text-gray-500"
                                            }
                                        >
                                            {s.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                        {new Date(
                                            s.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
