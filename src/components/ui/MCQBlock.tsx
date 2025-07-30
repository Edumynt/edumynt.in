import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Check, X, Lightbulb, RotateCcw } from 'lucide-react';

export interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hint?: string;
}

interface MCQBlockProps {
  questions: MCQQuestion[];
  title?: string;
  showProgress?: boolean;
  className?: string;
}

interface QuestionState {
  selectedAnswer: number | null;
  showAnswer: boolean;
  showExplanation: boolean;
  showHint: boolean;
  isCorrect: boolean | null;
}

const MCQBlock: React.FC<MCQBlockProps> = ({ 
  questions, 
  title, 
  showProgress = true, 
  className 
}) => {
  const [questionStates, setQuestionStates] = useState<Record<number, QuestionState>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Initialize question states
  useEffect(() => {
    const initialStates: Record<number, QuestionState> = {};
    questions.forEach(q => {
      initialStates[q.id] = {
        selectedAnswer: null,
        showAnswer: false,
        showExplanation: false,
        showHint: false,
        isCorrect: null
      };
    });
    setQuestionStates(initialStates);
  }, [questions]);

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = answerIndex === question.correctAnswer;
    
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedAnswer: answerIndex,
        showAnswer: true,
        showExplanation: true,
        isCorrect
      }
    }));
  };

  const handleShowHint = (questionId: number) => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        showHint: true
      }
    }));
  };

  const handleReset = (questionId: number) => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        selectedAnswer: null,
        showAnswer: false,
        showExplanation: false,
        showHint: false,
        isCorrect: null
      }
    }));
  };

  const getProgressStats = () => {
    const total = questions.length;
    const answered = Object.values(questionStates).filter(state => state.selectedAnswer !== null).length;
    const correct = Object.values(questionStates).filter(state => state.isCorrect === true).length;
    return { total, answered, correct };
  };

  const { total, answered, correct } = getProgressStats();

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {title}
          </h2>
          {showProgress && (
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <span>Total: {total}</span>
              <span>Answered: {answered}</span>
              <span className="text-green-600 dark:text-green-400">Correct: {correct}</span>
              <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(answered / total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-8">
        {questions.map((question, index) => {
          const state = questionStates[question.id] || {};
          
          return (
            <div
              key={question.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl"
            >
              {/* Question Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
                        {index + 1}
                      </span>
                      {state.isCorrect !== null && (
                        <div className={cn(
                          "flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium",
                          state.isCorrect 
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        )}>
                          {state.isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          <span>{state.isCorrect ? 'Correct' : 'Incorrect'}</span>
                        </div>
                      )}
                    </div>
                    <h3 
                      className="text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: question.question }}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {question.hint && !state.showHint && !state.showAnswer && (
                      <button
                        onClick={() => handleShowHint(question.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
                      >
                        <Lightbulb className="w-4 h-4" />
                        <span>Hint</span>
                      </button>
                    )}
                    
                    {state.selectedAnswer !== null && (
                      <button
                        onClick={() => handleReset(question.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Hint Display */}
                {state.showHint && question.hint && (
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Hint:</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">{question.hint}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="p-6">
                <div className="grid gap-3">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = state.selectedAnswer === optionIndex;
                    const isCorrect = optionIndex === question.correctAnswer;
                    const showResult = state.showAnswer;
                    
                    let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ";
                    
                    if (!showResult) {
                      buttonClass += isSelected 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 shadow-md transform scale-[1.02]"
                        : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10";
                    } else {
                      if (isCorrect) {
                        buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200";
                      } else if (isSelected && !isCorrect) {
                        buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200";
                      } else {
                        buttonClass += "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400";
                      }
                    }

                    return (
                      <button
                        key={optionIndex}
                        onClick={() => !showResult && handleAnswerSelect(question.id, optionIndex)}
                        disabled={showResult}
                        className={buttonClass}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-semibold">
                            {String.fromCharCode(97 + optionIndex)}
                          </span>
                          <span 
                            className="flex-1 font-medium"
                            dangerouslySetInnerHTML={{ __html: option }}
                          />
                          {showResult && isCorrect && (
                            <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {state.showExplanation && (
                  <div className="mt-6 p-5 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Explanation</span>
                    </h4>
                    <p 
                      className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: question.explanation }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {answered > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Progress Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{answered}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Questions Answered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{correct}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {answered > 0 ? Math.round((correct / answered) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQBlock;