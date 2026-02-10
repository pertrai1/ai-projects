import { describe, it, expect } from 'vitest';
import { ExperimentConfigSchema, ConditionSchema } from '../../src/schema/experiment.js';

describe('ConditionSchema', () => {
  it('accepts expert-hidden', () => {
    expect(ConditionSchema.safeParse('expert-hidden').success).toBe(true);
  });

  it('accepts expert-revealed', () => {
    expect(ConditionSchema.safeParse('expert-revealed').success).toBe(true);
  });

  it('rejects invalid condition', () => {
    expect(ConditionSchema.safeParse('expert-unknown').success).toBe(false);
  });
});

describe('ExperimentConfigSchema', () => {
  it('parses a valid config', () => {
    const result = ExperimentConfigSchema.safeParse({
      id: 'exp-001',
      condition: 'expert-hidden',
      taskIds: ['math-001', 'logic-001'],
    });
    expect(result.success).toBe(true);
  });

  it('applies default model', () => {
    const result = ExperimentConfigSchema.parse({
      id: 'exp-001',
      condition: 'expert-hidden',
      taskIds: ['math-001'],
    });
    expect(result.model).toBe('gpt-4o-mini');
  });

  it('applies default temperature', () => {
    const result = ExperimentConfigSchema.parse({
      id: 'exp-001',
      condition: 'expert-hidden',
      taskIds: ['math-001'],
    });
    expect(result.temperature).toBe(0);
  });

  it('allows overriding defaults', () => {
    const result = ExperimentConfigSchema.parse({
      id: 'exp-001',
      condition: 'expert-revealed',
      model: 'gpt-4o',
      temperature: 0.5,
      taskIds: ['math-001'],
    });
    expect(result.model).toBe('gpt-4o');
    expect(result.temperature).toBe(0.5);
  });

  it('rejects invalid condition', () => {
    const result = ExperimentConfigSchema.safeParse({
      id: 'exp-001',
      condition: 'expert-unknown',
      taskIds: ['math-001'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty taskIds', () => {
    const result = ExperimentConfigSchema.safeParse({
      id: 'exp-001',
      condition: 'expert-hidden',
      taskIds: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects temperature out of range', () => {
    const result = ExperimentConfigSchema.safeParse({
      id: 'exp-001',
      condition: 'expert-hidden',
      taskIds: ['math-001'],
      temperature: 3,
    });
    expect(result.success).toBe(false);
  });
});
