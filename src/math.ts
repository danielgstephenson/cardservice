export function range (a: number, b: number): number[] {
  return [...Array(b - a + 1).keys()].map(i => a + i)
}

export function shuffle <T>(array: T[]): T[] {
  return array
    .map(item => ({ value: item, priority: Math.random() }))
    .sort((a, b) => a.priority - b.priority)
    .map(x => x.value)
}