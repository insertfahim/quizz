interface IQuiz {
    id: string;
    title: string;
    description?: string | null;
    image?: string | null;
    questions: IQuestion[];
}

interface IQuestion {
    id: string;
    text: string;
    difficulty?: string | null;
    options: IOption[];
}

interface IResponse {
    questionId: string;
    optionId: string;
    isCorrect: boolean;
}

interface IOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

// Admin-specific interfaces
interface IAdminStats {
    overview: {
        totalUsers: number;
        totalStudents: number;
        totalTeachers: number;
        totalAdmins: number;
        activeUsers: number;
        totalQuizzes: number;
        activeQuizzes: number;
        totalSubmissions: number;
        totalTasks: number;
        completedTasks: number;
        totalQuestions: number;
        averageScore: number;
    };
    growth: {
        userGrowth: number;
        submissionGrowth: number;
    };
    recentActivity: {
        recentUsers: IUser[];
        recentSubmissions: ISubmission[];
    };
    distribution: {
        usersByRole: Array<{ role: string; count: number }>;
        submissionsByDay: Array<{ date: string; count: number }>;
    };
    popular: {
        quizzes: IQuiz[];
    };
    userActivity: IUser[];
}

interface IUser {
    id: string;
    clerkId: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: {
        createdQuizzes: number;
        submissions: number;
        tasks: number;
    };
}

interface ISubmission {
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
}

interface IAuditLog {
    id: string;
    action: string;
    targetType: string;
    targetId?: string;
    details?: any;
    adminId: string;
    admin: IUser;
    createdAt: string;
}

export type {
    IQuiz,
    IQuestion,
    IOption,
    IResponse,
    IAdminStats,
    IUser,
    ISubmission,
    IAuditLog,
};
