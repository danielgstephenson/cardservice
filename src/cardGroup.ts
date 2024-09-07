import { Card } from './card'

export class CardGroup {
  array: Card[]

  constructor (array?: Card[]) {
    this.array = array != null ? Card.cloneCards(array) : []
  }

  add (card: Card): void {
    this.array.push(card)
  }

  remove (card: Card): void {
    const contains = this.array.includes(card)
    if (!contains) throw new Error('CardGroup.remove: this card is not in the group')
    this.array = this.array.filter(c => c !== card)
  }

  size (): number {
    return this.array.length
  }
}
