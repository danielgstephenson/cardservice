import { Card } from './card'

export function arrayToString (input: number[] | string[]): string {
  if (input.length === 0) throw new Error('arrayToString: input.length == 0')
  const array = [...input]
  const lastElement = array.pop()
  const firstString = array.join(', ')
  if (lastElement == null) throw new Error('arrayToString: lastElement undefined')
  if (input.length === 2) {
    return `${input[0]} and ${lastElement}`
  }
  return `${firstString}, and ${lastElement}`
}

export function cardsToString (cards: Card[]): string {
  if (cards.length === 0) throw new Error('cardsToString: cards.length == 0')
  const ranks = cards.map(card => card.rank)
  return arrayToString(ranks)
}

export function numberToString (n: number): string {
  if (n === 1) return 'one'
  if (n === 2) return 'two'
  if (n === 3) return 'three'
  if (n === 4) return 'four'
  throw new Error(`numberToString cannot convert number ${n} to a string.`)
}
