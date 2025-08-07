"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    isTeacher: boolean;
    isStudent: boolean;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const response = await axios.get("/api/auth/me");
            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const value = {
        user,
        loading,
        isAdmin: user?.role === "admin",
        isTeacher: user?.role === "teacher",
        isStudent: user?.role === "student",
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
