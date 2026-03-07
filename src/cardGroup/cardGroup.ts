import { Card } from '../card'

export class CardGroup {
  label = ''
  array: Card[]

  constructor (array?: Card[]) {
    this.array = array != null ? Card.cloneCards(array) : []
    this.array.forEach(card => { card.group = this })
  }

  add (card: Card, prepend = false): void {
    if (card.group != null) {
      card.group.remove(card)
    }
    if (prepend) this.array.unshift(card)
    else this.array.push(card)
    card.group = this
  }

  addCards (cards: Card[]): void {
    cards.forEach(card => this.add(card))
  }

  remove (card: Card): void {
    const contains = this.array.includes(card)
    if (!contains) throw new Error(`CardGroup.remove: card ${card.id} is not in group ${this.label}`)
    this.array = this.array.filter(c => c !== card)
    card.group = undefined
  }

  size (): number {
    return this.array.length
  }
}
