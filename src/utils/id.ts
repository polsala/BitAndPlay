const counters: Record<string, number> = {};

export const createDeterministicId = (prefix: string) => {
  counters[prefix] = (counters[prefix] ?? 0) + 1;
  return `${prefix}-${counters[prefix]}`;
};
