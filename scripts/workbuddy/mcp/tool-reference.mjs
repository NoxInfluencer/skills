function parameterType(schema) {
  if (Array.isArray(schema.type)) return schema.type.join(' or ');
  if (schema.type === 'array' && schema.items) return `array of ${parameterType(schema.items)}`;
  if (schema.type) return schema.type;
  if (schema.anyOf) return [...new Set(schema.anyOf.map(parameterType))].join(' or ');
  return 'see live schema';
}

export function renderToolReferences(tools, purposes) {
  const groups = new Map();
  const names = new Set(tools.map(tool => tool.name));
  for (const name of Object.keys(purposes)) {
    if (!names.has(name)) throw new Error(`WorkBuddy purpose has no matching MCP tool: ${name}`);
  }

  for (const { name, workflow, input_schema: schema } of tools) {
    const purpose = purposes[name];
    if (typeof purpose !== 'string' || !purpose.trim()) throw new Error(`Missing WorkBuddy tool purpose: ${name}`);
    const group = workflow ?? 'general';
    if (!/^[a-z0-9-]+$/.test(group)) throw new Error(`Invalid MCP workflow: ${group}`);
    if (!groups.has(group)) groups.set(group, []);

    const required = new Set(schema.required ?? []);
    const parameters = Object.entries(schema.properties ?? {}).map(([field, spec]) => {
      const details = [parameterType(spec), required.has(field) ? 'required' : 'optional'];
      if (Object.hasOwn(spec, 'default')) details.push(`default ${JSON.stringify(spec.default)}`);
      const description = spec.description?.trim().replace(/\s+/g, ' ')
        .replace('Encrypted BFF creator id', 'Opaque creator ID');
      return `- \`${field}\` (${details.join(', ')}).${description ? ` ${description}` : ''}`;
    });
    const body = [`## \`${name}\``, purpose, parameters.join('\n') || 'No input parameters.'].join('\n\n');
    groups.get(group).push({ name, body });
  }

  const files = new Map();
  const index = [
    '# MCP Tool List',
    `This build documents ${tools.length} tools. The connected MCP server's live catalog and schema determine which tools and parameters can be used. Read the reference for the relevant workflow.`,
    'For intelligent marketing-plan task lists, use `campaign2_plan_list` with the live pagination and filters. Follow `@references/handoffs.md` for presentation.',
  ];
  for (const [group, entries] of [...groups].sort(([a], [b]) => a.localeCompare(b, 'en'))) {
    const path = `references/tool-parameters-${group}.md`;
    entries.sort((a, b) => a.name.localeCompare(b.name, 'en'));
    const names = entries.map(({ name }) => `- \`${name}\``).join('\n');
    index.push(`## ${group}\n\nPurposes and parameters: \`@${path}\`\n\n${names}`);
    files.set(path, Buffer.from([`# MCP Tools: ${group}`, ...entries.map(({ body }) => body)].join('\n\n') + '\n'));
  }
  files.set('references/tool-list.md', Buffer.from(index.join('\n\n') + '\n'));
  return files;
}
