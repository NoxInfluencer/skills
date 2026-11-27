function parameterType(schema) {
  if (Array.isArray(schema.type)) return schema.type.join(' or ');
  if (schema.type === 'array' && schema.items) return `array of ${parameterType(schema.items)}`;
  if (schema.type) return schema.type;
  if (schema.anyOf) return [...new Set(schema.anyOf.map(parameterType))].join(' or ');
  return 'see live schema';
}

function renderTool({ name, description, input_schema: schema }) {
  if (typeof description !== 'string' || !description.trim()) {
    throw new Error(`Missing MCP tool description: ${name}`);
  }
  const required = new Set(schema.required ?? []);
  const parameters = Object.entries(schema.properties ?? {}).map(([field, spec]) => {
    const details = [parameterType(spec), required.has(field) ? 'required' : 'optional'];
    if (Object.hasOwn(spec, 'default')) details.push(`default ${JSON.stringify(spec.default)}`);
    const summary = spec.description?.trim().replace(/\s+/g, ' ')
      .replace('Encrypted BFF creator id', 'Opaque creator ID');
    return `- \`${field}\` (${details.join(', ')}).${summary ? ` ${summary}` : ''}`;
  });
  return [`## \`${name}\``, description.trim(), parameters.join('\n') || 'No input parameters.'].join('\n\n');
}

/** Derive the index and optional parameter references from one catalog. */
export function renderMcpToolReferences(tools, { includeParameters }) {
  const groups = new Map();
  for (const tool of tools) {
    const group = tool.workflow ?? 'creator-collection-crm-monitor-exports-quota';
    if (!/^[a-z0-9-]+$/.test(group)) throw new Error(`Invalid MCP workflow: ${group}`);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(tool);
  }

  const files = new Map();
  const index = [
    '# MCP Tool List',
    `This build contains ${tools.length} catalogued tools. Use only tools also exposed by the live provider, with their live input schemas. A catalog entry is not proof of deployment.`,
    'For intelligent marketing-plan task lists, use `campaign2_plan_list` with its live pagination and filter schema. Preserve filters for the next page. After verifying the business outcome, present it according to `references/handoffs.md`. Use actual live names and schemas, including tools added after this snapshot.',
  ];
  for (const [group, entries] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    entries.sort((a, b) => a.name.localeCompare(b.name, 'en'));
    index.push(`## ${group}`);
    if (includeParameters) {
      const path = `references/tool-parameters-${group}.md`;
      index.push(`See \`{baseDir}/${path}\` for tool purposes and parameters.`);
      files.set(path, Buffer.from([`# MCP tools for ${group}`, ...entries.map(renderTool)].join('\n\n') + '\n'));
    }
    index.push(entries.map(({ name }) => `- \`${name}\``).join('\n'));
  }
  files.set('references/tool-list.md', Buffer.from(index.join('\n\n') + '\n'));
  return files;
}
