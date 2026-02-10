import { z } from 'zod';

export const ConditionSchema = z.enum(['expert-hidden', 'expert-revealed']);
export type Condition = z.infer<typeof ConditionSchema>;

export const ExperimentConfigSchema = z.object({
  id: z.string().min(1),
  condition: ConditionSchema,
  model: z.string().min(1).default('gpt-4o-mini'),
  temperature: z.number().min(0).max(2).default(0),
  taskIds: z.array(z.string().min(1)).min(1),
});
export type ExperimentConfig = z.infer<typeof ExperimentConfigSchema>;
