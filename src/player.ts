import { InputPlayer } from './external'
import { State } from './state'
import { Card } from './card'
import { CardGroup } from './cardGroup'

export class Player {
  id: string
  userId: string
  gameId: string
  state: State
  name: string
  hand: CardGroup
  reserve: CardGroup
  inPlay = new CardGroup()
  trash = new CardGroup()
  majorMoney: number
  minorMoney = 0
  playReady = false
  withdrawn = false
  auctionReady = false
  playCard: Card | null = null
  trashCard: Card | null = null
  bid = 0

  constructor (state: State, inputPlayer: InputPlayer) {
    this.id = inputPlayer.id
    this.userId = inputPlayer.userId
    this.name = inputPlayer.name
    this.gameId = state.input.gameId
    this.state = state
    this.hand = new CardGroup(state.startingHand)
    this.reserve = new CardGroup(state.startingReserve)
    this.majorMoney = 70 - 10 * state.input.playerCount
    state.players.set(this.id, this)
  }
}
