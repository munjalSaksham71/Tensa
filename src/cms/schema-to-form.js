function inferControlType(definition) {
  if (definition.enum) return 'select';
  if (definition.type === 'boolean') return 'switch';
  if (definition.format === 'color') return 'color';
  if (definition.type === 'number' || definition.type === 'integer') return 'number';
  return 'text';
}

export function schemaToFields(schema) {
  const properties = schema?.properties ?? {};

  return Object.entries(properties).map(([name, definition]) => ({
    name,
    label: definition.title ?? name,
    control: inferControlType(definition),
    required: (schema.required ?? []).includes(name),
    options: definition.enum ?? [],
    description: definition.description ?? '',
    defaultValue: definition.default,
  }));
}
