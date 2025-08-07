"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

export default function RoleSelectPage() {
    const { user, isTeacher, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // This page is deprecated with local auth - roles are set during registration
        // Redirect to appropriate dashboard based on user role
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (isAdmin) {
                router.push("/admin");
            } else if (isTeacher) {
                router.push("/teacher");
            } else {
                router.push("/");
            }
        }
    }, [user, isTeacher, isAdmin, loading, router]);

    return <Loader />;
}
