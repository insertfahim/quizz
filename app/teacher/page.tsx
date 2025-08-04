"use client";

import { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/globalContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Users, TrendingUp, Clock } from "lucide-react";
import Loader from "@/components/Loader";

interface TeacherStats {
  overview: {
    totalQuizzes: number;
    activeQuizzes: number;
    totalSubmissions: number;
    totalStudents: number;
  };
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
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  category: {
    name: string;
  };
  _count: {
    questions: number;
    submissions: number;
  };
}

export default function TeacherDashboard() {
  const { isTeacher, loading } = useGlobalContext();
  const router = useRouter();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isTeacher) {
      router.push("/");
      return;
    }

    if (isTeacher) {
      fetchDashboardData();
    }
  }, [isTeacher, loading, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsResponse, quizzesResponse] = await Promise.all([
        axios.get("/api/teacher/stats"),
        axios.get("/api/teacher/quizzes"),
      ]);

      setStats(statsResponse.data);
      setQuizzes(quizzesResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600">Manage your quizzes and view student progress</p>
        </div>
        <Link href="/teacher/quiz/create">
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Create New Quiz
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold">{stats.overview.totalQuizzes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Quizzes</p>
                <p className="text-2xl font-bold">{stats.overview.activeQuizzes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{stats.overview.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Submissions</p>
                <p className="text-2xl font-bold">{stats.overview.totalSubmissions}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Quizzes */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Quizzes</h2>
            <Link href="/teacher/quizzes">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {quizzes.slice(0, 5).map((quiz) => (
              <div key={quiz.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">{quiz.title}</h3>
                  <p className="text-sm text-gray-600">
                    {quiz.category.name} • {quiz._count.questions} questions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{quiz._count.submissions} submissions</p>
                  <p className={`text-xs ${quiz.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {quiz.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            ))}
            {quizzes.length === 0 && (
              <p className="text-gray-500 text-center py-4">No quizzes created yet</p>
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
          <div className="space-y-3">
            {stats?.recentSubmissions.slice(0, 5).map((submission) => (
              <div key={submission.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">{submission.user.name}</h3>
                  <p className="text-sm text-gray-600">{submission.quiz.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{submission.score.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {!stats?.recentSubmissions.length && (
              <p className="text-gray-500 text-center py-4">No submissions yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/teacher/quiz/create">
            <Button variant="outline" className="w-full h-16">
              <Plus className="w-5 h-5 mr-2" />
              Create New Quiz
            </Button>
          </Link>
          <Link href="/teacher/quizzes">
            <Button variant="outline" className="w-full h-16">
              <BookOpen className="w-5 h-5 mr-2" />
              Manage Quizzes
            </Button>
          </Link>
          <Link href="/teacher/students">
            <Button variant="outline" className="w-full h-16">
              <Users className="w-5 h-5 mr-2" />
              View Students
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}