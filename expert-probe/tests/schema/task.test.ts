import { describe, it, expect } from 'vitest';
import { TaskSchema } from '../../src/schema/task.js';
import { evaluationTasks } from '../../src/fixtures/tasks.js';

describe('TaskSchema', () => {
  it('parses a valid task', () => {
    const result = TaskSchema.safeParse({
      id: 'math-001',
      question: 'What is 2 + 2?',
      correctAnswer: '4',
      type: 'math',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing id', () => {
    const result = TaskSchema.safeParse({
      question: 'What is 2 + 2?',
      correctAnswer: '4',
      type: 'math',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty id', () => {
    const result = TaskSchema.safeParse({
      id: '',
      question: 'What is 2 + 2?',
      correctAnswer: '4',
      type: 'math',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing question', () => {
    const result = TaskSchema.safeParse({
      id: 'math-001',
      correctAnswer: '4',
      type: 'math',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid type', () => {
    const result = TaskSchema.safeParse({
      id: 'math-001',
      question: 'What is 2 + 2?',
      correctAnswer: '4',
      type: 'essay',
    });
    expect(result.success).toBe(false);
  });
});

describe('evaluationTasks fixtures', () => {
  it('contains exactly 5 tasks', () => {
    expect(evaluationTasks).toHaveLength(5);
  });

  it('all fixtures validate against TaskSchema', () => {
    for (const task of evaluationTasks) {
      const result = TaskSchema.safeParse(task);
      expect(result.success).toBe(true);
    }
  });

  it('all fixtures have unique ids', () => {
    const ids = evaluationTasks.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
