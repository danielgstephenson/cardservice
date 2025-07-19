import { Card } from '../card'
import { Player } from '../player'
import { PlayerCardGroup } from './playerCardGroup'

export class Deck extends PlayerCardGroup {
  constructor (player: Player, array?: Card[]) {
    super(player, array)
    this.label = `deck of player ${player.name}`
  }
}
