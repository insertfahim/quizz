"use client";

import { useState } from "react";
import { useGlobalContext } from "@/context/globalContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users } from "lucide-react";
import toast from "react-hot-toast";

interface RoleSelectionProps {
  onRoleSelected?: () => void;
}

export default function RoleSelection({ onRoleSelected }: RoleSelectionProps) {
  const { updateUserRole } = useGlobalContext();
  const [isUpdating, setIsUpdating] = useState(false);

  const selectRole = async (role: "student" | "teacher") => {
    try {
      setIsUpdating(true);
      await updateUserRole(role);
      toast.success(`Role set to ${role} successfully!`);
      onRoleSelected?.();
    } catch (error) {
      toast.error("Failed to set role. Please try again.");
      console.error("Error setting role:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to BRACU Progress
          </h1>
          <p className="text-gray-600">
            Please select your role to get started with the platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Student Role */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Student</CardTitle>
              <CardDescription>
                Take quizzes, track your progress, and view your performance analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Take quizzes across different subjects</li>
                <li>• View your scores and progress</li>
                <li>• Track performance over time</li>
                <li>• Access study materials</li>
              </ul>
              <Button
                onClick={() => selectRole("student")}
                disabled={isUpdating}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                {isUpdating ? "Setting up..." : "Continue as Student"}
              </Button>
            </CardContent>
          </Card>

          {/* Teacher Role */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Teacher</CardTitle>
              <CardDescription>
                Create and manage quizzes, view student performance, and track class progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Create and edit quizzes</li>
                <li>• Manage quiz questions and options</li>
                <li>• View student submissions</li>
                <li>• Generate performance reports</li>
              </ul>
              <Button
                onClick={() => selectRole("teacher")}
                disabled={isUpdating}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                {isUpdating ? "Setting up..." : "Continue as Teacher"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          You can change your role later in your profile settings
        </div>
      </div>
    </div>
  );
}