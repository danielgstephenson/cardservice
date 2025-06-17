import { Card } from './card'

export class CardGroup {
  label = ''
  array: Card[]

  constructor (array?: Card[]) {
    this.array = array != null ? Card.cloneCards(array) : []
  }

  add (card: Card): void {
    if (card.group != null) {
      let message = `CardGroup.add: cannot add card ${card.id} to group ${this.label}.`
      message += `Card ${card.id} is already in group ${card.group.label}`
      throw new Error(message)
    }
    this.array.push(card)
    card.group = this
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
