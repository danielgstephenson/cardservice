import { Card } from './card'

export class CardGroup {
  label = ''
  array: Card[]

  constructor (array?: Card[]) {
    this.array = array != null ? Card.cloneCards(array) : []
  }

  add (card: Card): void {
    if (card.cardGroup != null) {
      let message = `CardGroup.add: Cannot add Card ${card.id} to CardGroup ${this.label}.`
      message += `Card ${card.id} is already in group ${card.cardGroup.label}`
      throw new Error(message)
    }
    this.array.push(card)
    card.cardGroup = this
  }

  remove (card: Card): void {
    const contains = this.array.includes(card)
    if (!contains) throw new Error('CardGroup.remove: this card is not in the group')
    this.array = this.array.filter(c => c !== card)
    card.cardGroup = undefined
  }

  size (): number {
    return this.array.length
  }
}
