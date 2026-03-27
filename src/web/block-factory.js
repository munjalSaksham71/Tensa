function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function buildBlockFromDefinition(definition) {
  return {
    id: createId(definition.type),
    type: definition.type,
    props: structuredClone(definition.defaultProps ?? {}),
    styles: {},
    children: [],
  };
}
