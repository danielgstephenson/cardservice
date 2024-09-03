import Rand from 'rand-seed'
import * as External from './external'
import { TrashCard, Input, InputPlayer, Episode } from './external'
import { State } from './state'
import { Card } from './card'

export class Player {
  id: string
  userId: string
  gameId: string
  name: string
  hand: Card[] = []
  reserve: Card[] = []
  inPlay: Card[] = []
  trash: TrashCard[] = []
  majorMoney: number
  minorMoney = 0
  playReady = false
  withdrawn = false
  auctionReady = false
  playCard: Card | null = null
  trashCard: Card | null = null
  bid = 0

  constructor(state: State, inputPlayer: InputPlayer) {
    this.id = inputPlayer.id
    this.userId = inputPlayer.userId
    this.name = inputPlayer.name
    this.gameId = state.input.gameId
    this.hand = Card.cloneCards(state.startingHand)
    this.reserve = Card.cloneCards(state.startingReserve)
    this.majorMoney = 70 - 10 * state.input.playerCount
  }
}