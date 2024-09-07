import { Card } from './card'

export function arrayToString (input: number[] | string[]): string {
  const array = [...input]
  const lastElement = array.pop()
  const firstString = array.join(', ')
  if (lastElement == null) throw new Error('arrayToString: lastElement undfined')
  const string = `${firstString}, and ${lastElement}`
  return string
}

export function cardsToString (cards: Card[]): string {
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
