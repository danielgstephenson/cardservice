import { Card } from '../card'
import { PlayerCardGroup } from './playerCardGroup'

export class Trash extends PlayerCardGroup {
  add (card: Card): void {
    super.add(card)
    card.trashRound = card.state.round
  }
}
