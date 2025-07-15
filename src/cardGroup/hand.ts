import { Card } from '../card'
import { Player } from '../player'
import { PlayerCardGroup } from './playerCardGroup'

export class Hand extends PlayerCardGroup {
  possible: Card[] = []

  constructor (player: Player, array?: Card[]) {
    super(player, array)
    this.array.forEach(card => { this.possible.push(card) })
  }

  add (card: Card): void {
    super.add(card)
    this.possible.push(card)
  }

  impossible (card: Card): void {
    this.possible = this.possible.filter(c => c.id !== card.id)
  }
}
