import { z } from 'zod';

export const AgentRoleSchema = z.enum([
  'expert',
  'non-expert-a',
  'non-expert-b',
  'moderator',
]);
export type AgentRole = z.infer<typeof AgentRoleSchema>;

export const AgentConfigSchema = z.object({
  id: z.string().min(1),
  role: AgentRoleSchema,
  systemPrompt: z.string().min(1),
});
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
