"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGlobalContext } from "@/context/globalContext";
import { play } from "@/utils/Icons";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";

function page() {
  const router = useRouter();
  const { quizResponses, selectedQuiz, filteredQuestions } = useGlobalContext();
  const [showExplanations, setShowExplanations] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

  if (!quizResponses || quizResponses.length === 0) {
    return router.push("/"); /// redirect to home page
  }

  // calculate the score
  const correctAnswers = quizResponses.filter(
    (res: { isCorrect: boolean }) => res.isCorrect
  ).length;

  const totalQuestions = quizResponses.length;
  const scorePercentage = (correctAnswers / totalQuestions) * 100;

  const toggleQuestionExpansion = (index: number) => {
    setExpandedQuestions(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Show message for the score
  let message = "";

  if (scorePercentage < 25) {
    message = "You need to try harder!";
  } else if (scorePercentage >= 25 && scorePercentage < 50) {
    message = "You're getting there! Keep practicing.";
  } else if (scorePercentage >= 50 && scorePercentage < 75) {
    message = "Good effort! You're above average.";
  } else if (scorePercentage >= 75 && scorePercentage < 100) {
    message = "Great job! You're so close to perfect!";
  } else if (scorePercentage === 100) {
    message = "Outstanding! You got everything right!";
  }

  return (
    <div className="py-10 flex flex-col gap-4 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center">Quiz Results</h1>

      <p className="text-2xl text-center mt-4">
        You scored <span className="font-bold">{correctAnswers}</span> out of{" "}
        {""}
        <span className="font-bold text-3xl">{totalQuestions}</span> {""}
      </p>

      <p className="text-blue-400 font-bold text-4xl text-center">
        {scorePercentage.toFixed()}%
      </p>

      <p className="text-2xl text-center mt-2 font-semibold">{message}</p>

      <div className="flex justify-center gap-4 mt-6">
        <Button
          variant={"outline"}
          className="px-6 py-3"
          onClick={() => setShowExplanations(!showExplanations)}
        >
          {showExplanations ? "Hide" : "Show"} Answer Explanations
        </Button>
        <Button
          variant={"green"}
          className="px-10 py-6 font-bold text-white text-xl rounded-xl"
          onClick={() => router.push("/quiz/setup/" + `${selectedQuiz.id}`)}
        >
          {play} Play Again
        </Button>
      </div>

      {/* Answer Explanations Section */}
      {showExplanations && (
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold">Answer Review</h2>
          
          {quizResponses.map((response: any, index: number) => {
            const question = filteredQuestions[index];
            const isExpanded = expandedQuestions.includes(index);
            
            return (
              <Card key={index} className="p-4">
                <div 
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => toggleQuestionExpansion(index)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {response.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">Question {index + 1}</span>
                      <span className={`text-sm ${response.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {response.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{question?.text}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                
                {isExpanded && (
                  <div className="mt-4 pl-7 space-y-2">
                    <div>
                      <span className="font-medium text-sm text-gray-600">Your Answer: </span>
                      <span className={response.isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {response.selectedOption?.text || response.textAnswer || 'No answer'}
                      </span>
                    </div>
                    
                    {!response.isCorrect && (
                      <div>
                        <span className="font-medium text-sm text-gray-600">Correct Answer: </span>
                        <span className="text-green-600">
                          {question?.options?.find((opt: any) => opt.isCorrect)?.text || 'N/A'}
                        </span>
                      </div>
                    )}
                    
                    {question?.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-sm text-blue-900 mb-1">Explanation:</p>
                        <p className="text-sm text-blue-800">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default page;
