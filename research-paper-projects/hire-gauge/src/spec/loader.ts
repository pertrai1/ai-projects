import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { ExperimentSpecSchema, type ExperimentSpec } from './schema.js';
import { ZodError } from 'zod';

export class SpecValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: string[]
  ) {
    super(message);
    this.name = 'SpecValidationError';
  }
}

export function loadSpec(filePath: string): ExperimentSpec {
  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (err) {
    throw new SpecValidationError(`Failed to read spec file: ${filePath}`, [
      err instanceof Error ? err.message : String(err),
    ]);
  }

  let parsed: unknown;
  try {
    parsed = parse(content);
  } catch (err) {
    throw new SpecValidationError('Failed to parse YAML', [
      err instanceof Error ? err.message : String(err),
    ]);
  }

  try {
    return ExperimentSpecSchema.parse(parsed);
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => {
        const path = e.path.join('.');
        return path ? `${path}: ${e.message}` : e.message;
      });
      throw new SpecValidationError('Spec validation failed', errors);
    }
    throw err;
  }
}

export function computeFactorialSize(spec: ExperimentSpec): number {
  return Object.values(spec.factors).reduce((acc, factor) => acc * factor.levels.length, 1);
}
