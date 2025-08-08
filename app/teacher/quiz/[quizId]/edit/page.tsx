"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/Loader";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

interface QuizForm {
    title: string;
    description: string;
    timeLimit: string;
    isActive: boolean;
}

export default function EditQuizPage() {
    const { isTeacher, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const quizId = params.quizId as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState<QuizForm>({
        title: "",
        description: "",
        timeLimit: "",
        isActive: true,
    });

    useEffect(() => {
        if (!loading && !isTeacher) {
            router.push("/");
            return;
        }
        if (isTeacher && quizId) {
            loadQuiz();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTeacher, loading, quizId]);

    const loadQuiz = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(`/api/teacher/quizzes/${quizId}`);
            const q = res.data;
            setForm({
                title: q.title || "",
                description: q.description || "",
                timeLimit: q.timeLimit ? String(q.timeLimit) : "",
                isActive: Boolean(q.isActive),
            });
        } catch (e) {
            toast.error("Failed to load quiz");
            router.push(`/teacher/quiz/${quizId}`);
        } finally {
            setIsLoading(false);
        }
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            toast.error("Title is required");
            return;
        }
        try {
            setIsSaving(true);
            await axios.put(`/api/teacher/quizzes/${quizId}`, {
                title: form.title,
                description: form.description,
                timeLimit: form.timeLimit ? parseInt(form.timeLimit, 10) : null,
                isActive: form.isActive,
            });
            toast.success("Quiz updated");
            router.push(`/teacher/quiz/${quizId}`);
        } catch (e: any) {
            toast.error(e.response?.data?.error || "Failed to update quiz");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || isLoading) return <Loader />;
    if (!isTeacher) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/teacher/quiz/${quizId}`}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Edit Quiz</h1>
            </div>

            <form onSubmit={save} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quiz Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={(e) =>
                                    setForm({ ...form, title: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description: e.target.value,
                                    })
                                }
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="timeLimit">
                                Time Limit (minutes)
                            </Label>
                            <Input
                                id="timeLimit"
                                type="number"
                                min={1}
                                value={form.timeLimit}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        timeLimit: e.target.value,
                                    })
                                }
                                placeholder="Optional"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id="isActive"
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        isActive: e.target.checked,
                                    })
                                }
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Link href={`/teacher/quiz/${quizId}`}>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
