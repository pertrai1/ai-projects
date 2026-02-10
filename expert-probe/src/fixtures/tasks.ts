import type { Task } from '../schema/task.js';

export const evaluationTasks: readonly Task[] = [
  {
    id: 'math-001',
    question: 'What is 17 * 24?',
    correctAnswer: '408',
    type: 'math',
  },
  {
    id: 'math-002',
    question: 'What is the square root of 144?',
    correctAnswer: '12',
    type: 'math',
  },
  {
    id: 'logic-001',
    question:
      'If all roses are flowers and some flowers fade quickly, can we conclude that some roses fade quickly?',
    correctAnswer: 'No',
    type: 'logic',
  },
  {
    id: 'trivia-001',
    question: 'What is the chemical symbol for gold?',
    correctAnswer: 'Au',
    type: 'trivia',
  },
  {
    id: 'sat-001',
    question:
      'Architect is to building as author is to: (A) library (B) book (C) reading (D) writing',
    correctAnswer: 'B',
    type: 'sat',
  },
] as const;
