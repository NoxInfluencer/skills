/** Bind the packaged Manager's default product Skill without rewriting its guidance. */
export function bindManagerProductSkill(files, fromSkill, toSkill) {
  const reference = '`' + fromSkill + '`';
  const target = '`' + toSkill + '`';
  if (!files.get('SKILL.md')?.includes(reference)) {
    throw new Error(`Manager must reference the product Skill ${fromSkill}`);
  }
  return new Map([...files].map(([path, bytes]) => [
    path,
    path.endsWith('.md') ? Buffer.from(bytes.toString('utf8').replaceAll(reference, target)) : bytes,
  ]));
}
