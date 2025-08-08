"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { checkAuth } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please enter both email and password");
            return;
        }

        try {
            setIsLoading(true);

            const response = await axios.post("/api/auth/login", {
                email,
                password,
            });

            toast.success("Login successful!");

            // Ensure global auth state is updated before navigation
            await checkAuth();

            // Redirect based on role
            const user = response.data.user;
            if (user.role === "admin") {
                router.push("/admin");
            } else if (user.role === "teacher") {
                router.push("/teacher");
            } else {
                router.push("/");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Login failed";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm text-gray-600">
                        Don't have an account?{" "}
                        <button
                            onClick={() => router.push("/register")}
                            className="text-blue-600 hover:underline"
                        >
                            Register here
                        </button>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800 font-semibold">
                            Demo Admin Account:
                        </p>
                        <p className="text-xs text-blue-700">
                            Email: admin@test.com
                        </p>
                        <p className="text-xs text-blue-700">
                            Password: admin123
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
