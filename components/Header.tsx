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
            icon: home,
            link: "/",
        },
        {
            name: "Tasks",
            icon: "📋",
            link: "/tasks",
        },
        {
            name: "Leaderboard",
            icon: "🏆",
            link: "/leaderboard",
        },
        ...(isAdmin
            ? [
                  {
                      name: "Admin Panel",
                      icon: "🛡️",
                      link: "/admin",
                  },
                  {
                      name: "Manage Users",
                      icon: "👥",
                      link: "/admin/users",
                  },
                  {
                      name: "Manage Quizzes",
                      icon: "📚",
                      link: "/admin/quizzes",
                  },
              ]
            : isTeacher
            ? [
                  {
                      name: "Dashboard",
                      icon: chart,
                      link: "/teacher",
                  },
                  {
                      name: "Question Bank",
                      icon: "📚",
                      link: "/teacher/question-bank",
                  },
              ]
            : [
                  {
                      name: "My Stats",
                      icon: chart,
                      link: "/stats",
                  },
              ]),
    ];

    return (
        <header className="min-h-[8vh] px-[10rem] xl:px-[15rem] border-b-2 flex items-center">
            <nav className="flex-1 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/icon--logo-lg.png"
                        alt="logo"
                        width={50}
                        height={50}
                    />
                    <h1 className="text-3xl font-bold text-blue-400">
                        BRACU Progress
                    </h1>
                </Link>

                <ul className="flex items-center gap-8">
                    {menu.map((item, index) => (
                        <li key={index}>
                            <Link
                                href={item.link}
                                className={`py-1 px-6 flex items-center gap-2 text-lg leading-none text-gray-400 rounded-lg
                  ${
                      pathname === item.link
                          ? "bg-blue-500/20 text-blue-400 border-2 border-blue-400"
                          : ""
                  }
                  
                  `}
                            >
                                <span className="text-2xl text-blue-400">
                                    {item.icon}
                                </span>
                                <span
                                    className={`font-bold uppercase
                  ${pathname === item.link ? "text-blue-400" : "text-gray-400"}
                  `}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>

                <div>
                    {loading ? (
                        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    ) : user ? (
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {user.role}
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="ml-2"
                            >
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className="py-5 bg-blue-400 flex items-center gap-2 font-semibold text-lg rounded-lg
            hover:bg-blue-500/90"
                            onClick={() => router.push("/login")}
                        >
                            {login}
                            Login / Sign Up
                        </Button>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Header;
