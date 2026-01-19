import { z } from 'zod';

export const FactorSchema = z.object({
  levels: z.array(z.string()).min(2, 'Factor must have at least 2 levels'),
});

export const ThresholdsSchema = z.object({
  max_interaction_magnitude: z.number().positive(),
  max_profile_variance: z.number().positive(),
});

export const ModelConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic']),
  name: z.string(),
  temperature: z.number().min(0).max(2).default(0),
  max_retries: z.number().int().min(1).max(10).default(3),
});

export const ExperimentSpecSchema = z.object({
  version: z.string().default('1.0'),
  seed: z.number().int(),
  repetitions: z.number().int().min(2, 'Repetitions must be at least 2 for variance measurement'),
  mode: z.enum(['scoring', 'ranking']).default('scoring'),
  prompt_version: z.string(),
  factors: z.record(z.string(), FactorSchema).refine(
    (factors) => Object.keys(factors).length >= 2,
    'At least 2 factors are required'
  ),
  thresholds: ThresholdsSchema,
  model: ModelConfigSchema,
});

export type Factor = z.infer<typeof FactorSchema>;
export type Thresholds = z.infer<typeof ThresholdsSchema>;
export type ModelConfig = z.infer<typeof ModelConfigSchema>;
export type ExperimentSpec = z.infer<typeof ExperimentSpecSchema>;
