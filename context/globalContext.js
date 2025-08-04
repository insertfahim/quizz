import React, { useEffect, useState } from "react";
import useCategories from "./useCategories";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

const GlobalContext = React.createContext();

export const GlobalContextProvider = ({ children }) => {
    const { loading, categories } = useCategories();
    const { user, isLoaded } = useUser();

    const [dbUser, setDbUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    const [quizSetup, setQuizSetup] = React.useState({
        questionCount: 1,
        category: null,
        difficulty: null,
    });
    const [selectedQuiz, setSelectedQuiz] = React.useState(null);
    const [quizResponses, setQuizResponses] = React.useState([]);
    const [filteredQuestions, setFilteredQuestions] = React.useState([]);

    useEffect(() => {
        if (!isLoaded || !user?.emailAddresses[0]?.emailAddress) {
            setUserLoading(false);
            return;
        }

        const registerAndFetchUser = async () => {
            try {
                setUserLoading(true);

                // First register/update user with default role if not specified
                await axios.post("/api/user/register", {
                    role: "student", // Default role, can be changed later
                });

                // Then fetch user data with role information
                const response = await axios.get("/api/user");
                setDbUser(response.data);

                console.log("User registered/fetched successfully!");
            } catch (error) {
                console.error("Error with user setup:", error);
            } finally {
                setUserLoading(false);
            }
        };

        if (user?.emailAddresses[0]?.emailAddress) {
            registerAndFetchUser();
        }
    }, [user, isLoaded]);

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

    console.log("Filtered Questions:", filteredQuestions);

    return (
        <GlobalContext.Provider
            value={{
                loading: loading || userLoading,
                categories,
                user: dbUser,
                userRole: dbUser?.role,
                isTeacher: dbUser?.role === "teacher",
                isStudent: dbUser?.role === "student",
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
