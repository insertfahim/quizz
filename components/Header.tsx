"use client";
import { chart, home, login } from "@/utils/Icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Button } from "./ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import {
    CheckCircle,
    Calendar,
    Trophy,
    Shield,
    Users,
    BookOpen,
    BarChart3,
    Target,
} from "lucide-react";

function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, isTeacher, isAdmin, checkAuth } = useAuth();

    const handleLogout = async () => {
        try {
            await axios.post("/api/auth/logout");
            await checkAuth(); // This will set user to null
            toast.success("Logged out successfully");
            router.push("/");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    const menu = [
        {
            name: "Home",
            icon: <Target className="w-5 h-5" />,
            link: "/",
        },
        {
            name: "Tasks",
            icon: <CheckCircle className="w-5 h-5" />,
            link: "/tasks",
        },
        {
            name: "Quizzes",
            icon: <BookOpen className="w-5 h-5" />,
            link: "/quiz",
        },
        {
            name: "Leaderboard",
            icon: <Trophy className="w-5 h-5" />,
            link: "/leaderboard",
        },
        ...(isAdmin
            ? [
                  {
                      name: "Admin Panel",
                      icon: <Shield className="w-5 h-5" />,
                      link: "/admin",
                  },
                  {
                      name: "Users",
                      icon: <Users className="w-5 h-5" />,
                      link: "/admin/users",
                  },
                  {
                      name: "Quiz Management",
                      icon: <BookOpen className="w-5 h-5" />,
                      link: "/admin/quizzes",
                  },
              ]
            : isTeacher
            ? [
                  {
                      name: "Dashboard",
                      icon: <BarChart3 className="w-5 h-5" />,
                      link: "/teacher",
                  },
                  {
                      name: "Question Bank",
                      icon: <BookOpen className="w-5 h-5" />,
                      link: "/teacher/question-bank",
                  },
              ]
            : [
                  {
                      name: "My Progress",
                      icon: <BarChart3 className="w-5 h-5" />,
                      link: "/stats",
                  },
              ]),
    ];

    return (
        <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 w-full">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between h-16 w-full">
                    {/* Logo Section */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Daily Progress
                                </h1>
                                <p className="text-xs text-gray-500 font-medium">
                                    Task & Quiz Manager
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Menu - Center */}
                    <div className="hidden md:flex flex-1 justify-center max-w-3xl mx-8">
                        <ul className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                            {menu.map((item, index) => (
                                <li key={index}>
                                    <Link
                                        href={item.link}
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 whitespace-nowrap
                                            ${
                                                pathname === item.link
                                                    ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                                                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                                            }
                                        `}
                                    >
                                        <span
                                            className={`transition-colors duration-200 ${
                                                pathname === item.link
                                                    ? "text-blue-600"
                                                    : "text-gray-400 group-hover:text-gray-600"
                                            }`}
                                        >
                                            {item.icon}
                                        </span>
                                        <span className="font-semibold text-xs lg:text-sm">
                                            {item.name}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* User Section - Right */}
                    <div className="flex-shrink-0 flex items-center gap-4">
                        {loading ? (
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden lg:block text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {user.role}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="hidden lg:flex hover:bg-gray-50 border-gray-300 text-sm"
                                >
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                onClick={() => router.push("/login")}
                            >
                                Get Started
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        {user && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Logout
                            </Button>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}

export default Header;
