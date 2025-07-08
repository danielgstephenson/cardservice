import Rand from 'rand-seed'

export function range (a: number, b?: number): number[] {
  if (b != null) {
    return [...Array(b - a + 1).keys()].map(i => a + i)
  }
  return [...Array(a).keys()]
}

export function shuffle <T> (array: T[], rand: Rand): T[] {
  return array
    .map(item => ({ value: item, priority: rand.next() }))
    .sort((a, b) => a.priority - b.priority)
    .map(x => x.value)
}

export function unique <T> (array: T[]): T[] {
  return [...new Set(array)]
}
