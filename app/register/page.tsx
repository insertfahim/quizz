"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { checkAuth } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            setIsLoading(true);

            const response = await axios.post("/api/auth/register", {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            toast.success("Registration successful!");

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
            const errorMessage =
                error.response?.data?.error || "Registration failed";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        Register
                    </CardTitle>
                    <CardDescription>
                        Create your account to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                placeholder="Confirm your password"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, role: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">
                                        Student
                                    </SelectItem>
                                    <SelectItem value="teacher">
                                        Teacher
                                    </SelectItem>
                                    <SelectItem value="admin">
                                        Administrator
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Registering..." : "Register"}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <button
                            onClick={() => router.push("/login")}
                            className="text-blue-600 hover:underline"
                        >
                            Login here
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
