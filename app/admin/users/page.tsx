"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
    Search,
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    Crown,
    GraduationCap,
    BookOpen,
    Shield,
} from "lucide-react";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";

interface User {
    id: string;
    clerkId: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
    _count: {
        createdQuizzes: number;
        submissions: number;
        tasks: number;
    };
}

interface UserListResponse {
    users: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export default function AdminUsersPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push("/");
            return;
        }

        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, loading, router, currentPage, searchTerm, roleFilter]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "10",
                ...(searchTerm && { search: searchTerm }),
                ...(roleFilter && { role: roleFilter }),
            });

            const response = await axios.get<UserListResponse>(
                `/api/admin/users?${params}`
            );
            setUsers(response.data.users);
            setTotalPages(response.data.pagination.pages);
            setTotalUsers(response.data.pagination.total);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleRoleFilter = (value: string) => {
        setRoleFilter(value === "all" ? "" : value);
        setCurrentPage(1);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
        try {
            const response = await axios.put(
                `/api/admin/users/${userId}`,
                updates
            );
            setUsers(
                users.map((user) =>
                    user.id === userId ? { ...user, ...response.data } : user
                )
            );
            toast.success("User updated successfully");
            setIsEditModalOpen(false);
            setSelectedUser(null);
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Failed to update user");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (
            !confirm(
                "Are you sure you want to delete this user? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            await axios.delete(`/api/admin/users/${userId}`);
            setUsers(users.filter((user) => user.id !== userId));
            toast.success("User deleted successfully");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "admin":
                return <Shield className="h-4 w-4 text-purple-500" />;
            case "teacher":
                return <BookOpen className="h-4 w-4 text-green-500" />;
            case "student":
                return <GraduationCap className="h-4 w-4 text-blue-500" />;
            default:
                return <UserCheck className="h-4 w-4 text-gray-500" />;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-purple-100 text-purple-800";
            case "teacher":
                return "bg-green-100 text-green-800";
            case "student":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading || isLoading) {
        return <Loader />;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-gray-600">
                        Manage user accounts, roles, and permissions
                    </p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Label htmlFor="search">Search Users</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="search"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="w-48">
                            <Label htmlFor="role">Filter by Role</Label>
                            <Select
                                value={roleFilter || "all"}
                                onValueChange={handleRoleFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All roles
                                    </SelectItem>
                                    <SelectItem value="student">
                                        Students
                                    </SelectItem>
                                    <SelectItem value="teacher">
                                        Teachers
                                    </SelectItem>
                                    <SelectItem value="admin">
                                        Admins
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users List */}
            <Card>
                <CardHeader>
                    <CardTitle>Users ({totalUsers})</CardTitle>
                    <CardDescription>
                        Showing {users.length} of {totalUsers} users
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        {getRoleIcon(user.role)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">
                                                {user.name}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                                    user.role
                                                )}`}
                                            >
                                                {user.role}
                                            </span>
                                            {!user.isActive && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {user.email}
                                        </p>
                                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                            <span>
                                                Quizzes:{" "}
                                                {user._count.createdQuizzes}
                                            </span>
                                            <span>
                                                Submissions:{" "}
                                                {user._count.submissions}
                                            </span>
                                            <span>
                                                Tasks: {user._count.tasks}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right text-sm">
                                        <p className="text-gray-600">
                                            Joined{" "}
                                            {new Date(
                                                user.createdAt
                                            ).toLocaleDateString()}
                                        </p>
                                        {user.lastLoginAt && (
                                            <p className="text-gray-500">
                                                Last seen{" "}
                                                {new Date(
                                                    user.lastLoginAt
                                                ).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditUser(user)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleDeleteUser(user.id)
                                            }
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {users.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No users found</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-4 text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage(
                                        Math.min(totalPages, currentPage + 1)
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Edit User</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    defaultValue={selectedUser.name}
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    defaultValue={selectedUser.email}
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-role">Role</Label>
                                <Select
                                    defaultValue={selectedUser.role}
                                    onValueChange={(value) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            role: value,
                                        })
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
                                            Admin
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="edit-active"
                                    checked={selectedUser.isActive}
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            isActive: e.target.checked,
                                        })
                                    }
                                />
                                <Label htmlFor="edit-active">Active</Label>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <Button
                                onClick={() =>
                                    handleUpdateUser(selectedUser.id, {
                                        name: selectedUser.name,
                                        email: selectedUser.email,
                                        role: selectedUser.role,
                                        isActive: selectedUser.isActive,
                                    })
                                }
                                className="flex-1"
                            >
                                Save Changes
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setSelectedUser(null);
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
