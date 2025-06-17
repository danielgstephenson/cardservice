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
    this.hand.label = `hand of player ${this.id}`
    this.reserve = new CardGroup(state.startingReserve)
    this.hand.label = `reserve of player ${this.id}`
    this.majorMoney = 70 - 10 * state.input.playerCount
    state.players.set(this.id, this)
  }

  earn (amount: number): void {
    if (amount < 0) {
      throw new Error('player.earn: amount must non-negative')
    }
    const minorAmount = amount % 5
    const majorAmount = amount - minorAmount
    this.minorMoney += minorAmount
    this.majorMoney += majorAmount
  }

  pay (amount: number): void {
    if (amount < 0) {
      throw new Error('player.pay: amount must non-negative')
    }
    const minorAmount = Math.min(this.minorMoney, amount)
    const majorAmount = Math.min(amount - minorAmount, this.majorMoney)
    this.minorMoney -= minorAmount
    this.majorMoney -= majorAmount
  }
}
