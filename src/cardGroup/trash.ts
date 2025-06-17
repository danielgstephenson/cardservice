import { Card } from '../card'
import { CardGroup } from './cardGroup'

export class Trash extends CardGroup {
  add (card: Card): void {
    super.add(card)
    card.trashRound = card.state.round
  }
}
