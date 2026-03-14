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

export function whichMax (array: number[]): number {
  let indexMax = 0
  let valueMax = array[0]
  array.forEach((value, index) => {
    if (value > valueMax) {
      indexMax = index
      valueMax = value
    }
  })
  return indexMax
}

export function whichMin (array: number[]): number {
  const negArray = array.map(x => -x)
  return whichMax(negArray)
}
