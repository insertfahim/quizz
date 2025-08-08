import React, { useEffect, useState } from "react";
import axios from "axios";

const GlobalContext = React.createContext();

export const GlobalContextProvider = ({ children }) => {
    // Using local auth endpoint instead of Clerk
    const [isLoaded, setIsLoaded] = useState(false);
    const [authUser, setAuthUser] = useState(null);

    const [dbUser, setDbUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    const [quizSetup, setQuizSetup] = React.useState({
        questionCount: 1,
        difficulty: null,
    });
    const [selectedQuiz, setSelectedQuiz] = React.useState(null);
    const [quizResponses, setQuizResponses] = React.useState([]);
    const [filteredQuestions, setFilteredQuestions] = React.useState([]);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                setUserLoading(true);
                const me = await axios.get("/api/auth/me");
                setAuthUser(me.data.user);
                setDbUser(me.data.user);
            } catch (error) {
                setAuthUser(null);
                setDbUser(null);
            } finally {
                setUserLoading(false);
                setIsLoaded(true);
            }
        };
        bootstrap();
    }, []);

    // Function to update user role
    const updateUserRole = async (newRole) => {
        try {
            const response = await axios.post("/api/user/register", {
                role: newRole,
            });
            setDbUser(response.data);
            return response.data;
        } catch (error) {
            console.error("Error updating user role:", error);
            throw error;
        }
    };

    return (
        <GlobalContext.Provider
            value={{
                loading: userLoading,
                user: dbUser,
                userRole: dbUser?.role,
                isTeacher: dbUser?.role === "teacher",
                isStudent: dbUser?.role === "student",
                isAdmin: dbUser?.role === "admin",
                hasElevatedPrivileges:
                    dbUser?.role === "admin" || dbUser?.role === "teacher",
                updateUserRole,
                quizSetup,
                setQuizSetup,
                selectedQuiz,
                setSelectedQuiz,
                quizResponses,
                setQuizResponses,
                filteredQuestions,
                setFilteredQuestions,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return React.useContext(GlobalContext);
};
