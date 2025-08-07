"use client";

import { useState, useEffect } from "react";
import { useGlobalContext } from "@/context/globalContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Search, Share2, Lock, Edit, Trash2, Copy } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";

interface QuestionBankItem {
  id: string;
  text: string;
  type: string;
  difficulty?: string;
  explanation?: string;
  category: string;
  isShared: boolean;
  options?: any;
  correctAnswer?: string;
  createdAt: string;
}

export default function QuestionBankPage() {
  const { isTeacher, loading: userLoading } = useGlobalContext();
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  
  const [formData, setFormData] = useState({
    text: "",
    type: "multiple_choice",
    difficulty: "medium",
    explanation: "",
    category: "Programming",
    isShared: false,
    options: ["", "", "", ""],
    correctAnswer: "0",
  });

  useEffect(() => {
    if (!userLoading && !isTeacher) {
      router.push("/");
      return;
    }

    if (isTeacher) {
      fetchQuestions();
    }
  }, [isTeacher, userLoading, router]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/teacher/question-bank");
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load question bank");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      toast.error("Question text is required");
      return;
    }

    // Prepare options based on question type
    let optionsData = null;
    let correctAnswerData = null;

    if (formData.type === "multiple_choice") {
      optionsData = formData.options.filter(opt => opt.trim());
      if (optionsData.length < 2) {
        toast.error("Please provide at least 2 options");
        return;
      }
      correctAnswerData = formData.correctAnswer;
    } else if (formData.type === "true_false") {
      optionsData = ["True", "False"];
      correctAnswerData = formData.correctAnswer === "0" ? "True" : "False";
    }

    try {
      const payload = {
        ...formData,
        options: optionsData,
        correctAnswer: correctAnswerData,
      };

      if (editingQuestion) {
        const response = await axios.put(`/api/teacher/question-bank/${editingQuestion.id}`, payload);
        setQuestions(questions.map(q => q.id === editingQuestion.id ? response.data : q));
        toast.success("Question updated successfully");
      } else {
        const response = await axios.post("/api/teacher/question-bank", payload);
        setQuestions([response.data, ...questions]);
        toast.success("Question added to bank");
      }
      
      resetForm();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Failed to save question");
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    
    try {
      await axios.delete(`/api/teacher/question-bank/${questionId}`);
      setQuestions(questions.filter(q => q.id !== questionId));
      toast.success("Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const handleToggleShare = async (questionId: string, currentShared: boolean) => {
    try {
      const response = await axios.patch(`/api/teacher/question-bank/${questionId}/share`, {
        isShared: !currentShared,
      });
      setQuestions(questions.map(q => q.id === questionId ? response.data : q));
      toast.success(currentShared ? "Question made private" : "Question shared with other teachers");
    } catch (error) {
      console.error("Error toggling share status:", error);
      toast.error("Failed to update share status");
    }
  };

  const handleCopyToQuiz = (question: QuestionBankItem) => {
    // Store question in session storage for use in quiz creation
    sessionStorage.setItem('copiedQuestion', JSON.stringify(question));
    toast.success("Question copied! Navigate to quiz creation to use it.");
  };

  const handleEdit = (question: QuestionBankItem) => {
    setEditingQuestion(question);
    const options = question.options || ["", "", "", ""];
    const correctAnswer = question.type === "multiple_choice" 
      ? (question.correctAnswer || "0")
      : question.correctAnswer === "True" ? "0" : "1";
    
    setFormData({
      text: question.text,
      type: question.type,
      difficulty: question.difficulty || "medium",
      explanation: question.explanation || "",
      category: question.category,
      isShared: question.isShared,
      options: Array.isArray(options) ? options : ["", "", "", ""],
      correctAnswer,
    });
    setShowAddQuestion(true);
  };

  const resetForm = () => {
    setFormData({
      text: "",
      type: "multiple_choice",
      difficulty: "medium",
      explanation: "",
      category: "Programming",
      isShared: false,
      options: ["", "", "", ""],
      correctAnswer: "0",
    });
    setEditingQuestion(null);
    setShowAddQuestion(false);
  };

  const filteredQuestions = questions.filter(question => {
    if (searchTerm && !question.text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterCategory !== "all" && question.category !== filterCategory) return false;
    if (filterType !== "all" && question.type !== filterType) return false;
    return true;
  });

  if (userLoading || loading) {
    return <Loader />;
  }

  if (!isTeacher) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-gray-600">Store and manage reusable questions</p>
        </div>
        <Button 
          onClick={() => setShowAddQuestion(!showAddQuestion)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Add/Edit Question Form */}
      {showAddQuestion && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingQuestion ? "Edit Question" : "Add New Question"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="text">Question Text *</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Enter question text"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Question Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Programming">Programming</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Options for Multiple Choice */}
            {formData.type === "multiple_choice" && (
              <div>
                <Label>Options</Label>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 mt-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === String(index)}
                      onChange={() => setFormData({ ...formData, correctAnswer: String(index) })}
                    />
                    <Label>Correct</Label>
                  </div>
                ))}
              </div>
            )}

            {/* Options for True/False */}
            {formData.type === "true_false" && (
              <div>
                <Label>Correct Answer</Label>
                <Select
                  value={formData.correctAnswer}
                  onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">True</SelectItem>
                    <SelectItem value="1">False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="explanation">Explanation (Optional)</Label>
              <Textarea
                id="explanation"
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Explain the correct answer"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isShared"
                checked={formData.isShared}
                onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
              />
              <Label htmlFor="isShared">Share with other teachers</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                {editingQuestion ? "Update Question" : "Add to Bank"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions..."
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Programming">Programming</SelectItem>
            <SelectItem value="Mathematics">Mathematics</SelectItem>
            <SelectItem value="Science">Science</SelectItem>
            <SelectItem value="History">History</SelectItem>
            <SelectItem value="Geography">Geography</SelectItem>
            <SelectItem value="Computer Science">Computer Science</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="true_false">True/False</SelectItem>
            <SelectItem value="short_answer">Short Answer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Questions List */}
      <div className="grid gap-4">
        {filteredQuestions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No questions found. Add your first question to the bank!</p>
          </Card>
        ) : (
          filteredQuestions.map((question) => (
            <Card key={question.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {question.isShared ? (
                      <Share2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-600">
                      {question.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{question.category}</span>
                    {question.difficulty && (
                      <>
                        <span className="text-sm text-gray-500">•</span>
                        <span className={`text-sm font-medium ${
                          question.difficulty === 'easy' ? 'text-green-500' :
                          question.difficulty === 'medium' ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {question.difficulty.toUpperCase()}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <p className="font-medium mb-2">{question.text}</p>
                  
                  {question.options && Array.isArray(question.options) && (
                    <div className="ml-4 text-sm text-gray-600">
                      {question.options.map((opt: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span>{String.fromCharCode(65 + idx)}.</span>
                          <span>{opt}</span>
                          {question.correctAnswer === String(idx) && (
                            <span className="text-green-500 font-medium">(Correct)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.explanation && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium">Explanation:</span> {question.explanation}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyToQuiz(question)}
                    title="Copy to quiz"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleShare(question.id, question.isShared)}
                    title={question.isShared ? "Make private" : "Share with others"}
                  >
                    {question.isShared ? <Lock className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(question)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(question.id)}
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
