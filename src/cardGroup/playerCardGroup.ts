import { Card } from '../card'
import { Player } from '../player'
import { CardGroup } from './cardGroup'

export class PlayerCardGroup extends CardGroup {
  player: Player

  constructor (player: Player, array?: Card[]) {
    super(array)
    this.player = player
  }

  add (card: Card): void {
    super.add(card)
    card.player = this.player
  }

  remove (card: Card): void {
    super.remove(card)
    card.player = undefined
  }
}
