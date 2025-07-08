import { Card } from './card'
import { Player } from './player'

export function arrayToString (input: number[] | string[]): string {
  const array = [...input]
  const lastElement = array.pop()
  const firstString = array.join(', ')
  if (input.length === 0) {
    return 'empty'
  }
  if (input.length === 1) {
    return `${input[0]}`
  }
  if (lastElement == null) throw new Error('arrayToString: lastElement undefined')
  if (input.length === 2) {
    return `${input[0]} and ${lastElement}`
  }
  return `${firstString}, and ${lastElement}`
}

export function cardsToString (cards: Card[]): string {
  const ranks = cards.map(card => card.rank)
  return arrayToString(ranks)
}

export function playersToString (players: Player[]): string {
  const names = players.map(player => player.name)
  return arrayToString(names)
}

export function numberToString (n: number): string {
  if (n === 1) return 'one'
  if (n === 2) return 'two'
  if (n === 3) return 'three'
  if (n === 4) return 'four'
  throw new Error(`numberToString cannot convert number ${n} to a string.`)
}
