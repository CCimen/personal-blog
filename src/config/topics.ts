export const TOPICS = {
  'ai-coding':         { label: 'AI Coding',         description: 'Claude Code, Cursor, MCP, and AI-assisted dev workflows.' },
  'models-evals':      { label: 'Models & Evals',    description: 'Comparing models, benchmark methodology, and eval results.' },
  'workflows':         { label: 'Workflows',         description: 'How I get work done day-to-day with AI tools.' },
  'team-practices':    { label: 'Team Practices',    description: 'How my team works, ships, and learns together.' },
  'gpu-infra':         { label: 'GPU / Infra',       description: 'Running models on our own hardware — GPUs, deployment, performance.' },
  'tools':             { label: 'Tools',             description: 'Software I use, why, and how I configure it.' },
  'notes-on-building': { label: 'Notes on Building', description: 'Lessons from shipping things — process, tradeoffs, decisions.' },
} as const;

export type TopicSlug = keyof typeof TOPICS;
export const TOPIC_SLUGS = Object.keys(TOPICS) as TopicSlug[];
