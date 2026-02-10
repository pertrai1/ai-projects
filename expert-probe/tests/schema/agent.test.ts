import { describe, it, expect } from 'vitest';
import { AgentConfigSchema } from '../../src/schema/agent.js';
import { defaultAgents } from '../../src/config/agents.js';

describe('AgentConfigSchema', () => {
  it('parses a valid agent config', () => {
    const result = AgentConfigSchema.safeParse({
      id: 'expert',
      role: 'expert',
      systemPrompt: 'You are an expert.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid role', () => {
    const result = AgentConfigSchema.safeParse({
      id: 'expert',
      role: 'wizard',
      systemPrompt: 'You are a wizard.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing systemPrompt', () => {
    const result = AgentConfigSchema.safeParse({
      id: 'expert',
      role: 'expert',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty id', () => {
    const result = AgentConfigSchema.safeParse({
      id: '',
      role: 'expert',
      systemPrompt: 'You are an expert.',
    });
    expect(result.success).toBe(false);
  });
});

describe('defaultAgents', () => {
  it('contains exactly 4 agents', () => {
    expect(defaultAgents).toHaveLength(4);
  });

  it('all default agents validate against schema', () => {
    for (const agent of defaultAgents) {
      const result = AgentConfigSchema.safeParse(agent);
      expect(result.success).toBe(true);
    }
  });

  it('includes all required roles', () => {
    const roles = defaultAgents.map((a) => a.role);
    expect(roles).toContain('expert');
    expect(roles).toContain('non-expert-a');
    expect(roles).toContain('non-expert-b');
    expect(roles).toContain('moderator');
  });
});
