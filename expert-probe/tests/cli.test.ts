import { describe, it, expect } from 'vitest';
import { evaluationTasks } from '../src/fixtures/tasks.js';
import { defaultAgents } from '../src/config/agents.js';
import type { Condition } from '../src/schema/experiment.js';

describe('CLI configuration', () => {
  it('has evaluation tasks available', () => {
    expect(evaluationTasks.length).toBeGreaterThan(0);
  });

  it('has default agents with all required roles', () => {
    const roles = defaultAgents.map((a) => a.role);
    expect(roles).toContain('expert');
    expect(roles).toContain('non-expert-a');
    expect(roles).toContain('non-expert-b');
    expect(roles).toContain('moderator');
  });

  it('supports both conditions', () => {
    const conditions: Condition[] = ['expert-hidden', 'expert-revealed'];
    expect(conditions).toHaveLength(2);
  });

  it('all task ids are unique', () => {
    const ids = evaluationTasks.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('default agents have unique ids', () => {
    const ids = defaultAgents.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
