"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
    Plus,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    Trash2,
    Edit,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";

interface Task {
    id: string;
    title: string;
    description?: string;
    category: string;
    priority: string;
    status: string;
    dueDate?: string;
    completedAt?: string;
    createdAt: string;
}

export default function TasksPage() {
    const { user, loading: userLoading } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddTask, setShowAddTask] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "study",
        priority: "medium",
        dueDate: "",
    });

    useEffect(() => {
        if (user) {
            fetchTasks();
        }
    }, [user]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/tasks");
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            toast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Task title is required");
            return;
        }

        try {
            if (editingTask) {
                const response = await axios.put(
                    `/api/tasks/${editingTask.id}`,
                    formData
                );
                setTasks(
                    tasks.map((t) =>
                        t.id === editingTask.id ? response.data : t
                    )
                );
                toast.success("Task updated successfully");
            } else {
                const response = await axios.post("/api/tasks", formData);
                setTasks([response.data, ...tasks]);
                toast.success("Task created successfully");
            }

            resetForm();
        } catch (error) {
            console.error("Error saving task:", error);
            toast.error("Failed to save task");
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            const response = await axios.patch(`/api/tasks/${taskId}/status`, {
                status: newStatus,
            });
            setTasks(tasks.map((t) => (t.id === taskId ? response.data : t)));

            if (newStatus === "completed") {
                toast.success("Task completed! 🎉");
            }
        } catch (error) {
            console.error("Error updating task status:", error);
            toast.error("Failed to update task status");
        }
    };

    const handleDelete = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            await axios.delete(`/api/tasks/${taskId}`);
            setTasks(tasks.filter((t) => t.id !== taskId));
            toast.success("Task deleted successfully");
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Failed to delete task");
        }
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || "",
            category: task.category,
            priority: task.priority,
            dueDate: task.dueDate
                ? new Date(task.dueDate).toISOString().split("T")[0]
                : "",
        });
        setShowAddTask(true);
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            category: "study",
            priority: "medium",
            dueDate: "",
        });
        setEditingTask(null);
        setShowAddTask(false);
    };

    const filteredTasks = tasks.filter((task) => {
        if (filterCategory !== "all" && task.category !== filterCategory)
            return false;
        if (filterStatus !== "all" && task.status !== filterStatus)
            return false;
        return true;
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "text-red-500";
            case "medium":
                return "text-yellow-500";
            case "low":
                return "text-green-500";
            default:
                return "text-gray-500";
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "study":
                return "📚";
            case "work":
                return "💼";
            case "personal":
                return "🏠";
            default:
                return "📌";
        }
    };

    if (userLoading || loading) {
        return <Loader />;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Task Planner</h1>
                    <p className="text-gray-600">
                        Organize and track your daily tasks
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddTask(!showAddTask)}
                    className="bg-blue-500 hover:bg-blue-600"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                </Button>
            </div>

            {/* Add/Edit Task Form */}
            {showAddTask && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingTask ? "Edit Task" : "Create New Task"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="title">Task Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="Enter task title"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            category: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="study">
                                            Study
                                        </SelectItem>
                                        <SelectItem value="work">
                                            Work
                                        </SelectItem>
                                        <SelectItem value="personal">
                                            Personal
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            priority: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="high">
                                            High
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            dueDate: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Enter task description (optional)"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                {editingTask ? "Update Task" : "Create Task"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="study">Study</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tasks List */}
            <div className="grid gap-4">
                {filteredTasks.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-gray-500">
                            No tasks found. Create your first task!
                        </p>
                    </Card>
                ) : (
                    filteredTasks.map((task) => (
                        <Card key={task.id} className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">
                                            {getCategoryIcon(task.category)}
                                        </span>
                                        <h3 className="font-semibold text-lg">
                                            {task.title}
                                        </h3>
                                        <span
                                            className={`text-sm font-medium ${getPriorityColor(
                                                task.priority
                                            )}`}
                                        >
                                            {task.priority.toUpperCase()}
                                        </span>
                                    </div>

                                    {task.description && (
                                        <p className="text-gray-600 mb-2">
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        {task.dueDate && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(
                                                    task.dueDate
                                                ).toLocaleDateString()}
                                            </div>
                                        )}

                                        <Select
                                            value={task.status}
                                            onValueChange={(value) =>
                                                handleStatusChange(
                                                    task.id,
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-[140px] h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Pending
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="in_progress">
                                                    <div className="flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        In Progress
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="completed">
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Completed
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(task)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(task.id)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
