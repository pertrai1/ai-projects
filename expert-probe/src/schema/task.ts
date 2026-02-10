import { z } from 'zod';

export const TaskTypeSchema = z.enum(['math', 'logic', 'trivia', 'sat']);
export type TaskType = z.infer<typeof TaskTypeSchema>;

export const TaskSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  correctAnswer: z.string().min(1),
  type: TaskTypeSchema,
});
export type Task = z.infer<typeof TaskSchema>;
