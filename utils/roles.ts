// This file only contains role constants - all auth functions have been moved to utils/auth.ts

export const USER_ROLES = {
    STUDENT: "student",
    TEACHER: "teacher",
    ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// All authentication functions have been moved to utils/auth.ts
// Please use the functions from utils/auth.ts instead:
// - getCurrentUser()
// - requireAuth()
// - requireAdmin()
// - requireTeacher()
