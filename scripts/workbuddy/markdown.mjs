export function markdownSection(text, heading) {
  const section = text.split(/(?=^## )/m).find(part => part.startsWith(heading + '\n'));
  if (!section) throw new Error(`Missing documentation section: ${heading}`);
  return section.trimEnd();
}

export function workBuddyOAuthReference(text, intro) {
  const headings = ['## Common Host Connection Setup', '## WorkBuddy Authorization',
    '## One Attempt, Then Resume', '## Failure Boundaries'];
  const sections = headings.map(heading => markdownSection(text, heading));
  return ['# WorkBuddy MCP Authorization And Task Continuation', intro, ...sections].filter(Boolean).join('\n\n') + '\n';
}
