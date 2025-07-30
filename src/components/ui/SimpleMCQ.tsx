import React from 'react';
import MCQBlock, { type MCQQuestion } from './MCQBlock.tsx';

interface SimpleMCQProps {
  title?: string;
  children: React.ReactNode;
  showProgress?: boolean;
}

// Helper function to parse MCQ data from children or props
const SimpleMCQ: React.FC<SimpleMCQProps> = ({ title, children, showProgress = true }) => {
  // For now, we'll use a placeholder. In practice, you would parse the questions
  // from the children or accept them as props
  const sampleQuestions: MCQQuestion[] = [
    {
      id: 1,
      question: "This is a sample question to demonstrate the MCQ component?",
      options: [
        "Option A - First choice",
        "Option B - Second choice", 
        "Option C - Third choice",
        "Option D - Fourth choice"
      ],
      correctAnswer: 1,
      explanation: "This is the explanation for why option B is correct. It provides detailed reasoning and context.",
      hint: "Think about the key concepts we've discussed."
    }
  ];

  return (
    <MCQBlock 
      questions={sampleQuestions}
      title={title}
      showProgress={showProgress}
    />
  );
};

export default SimpleMCQ;