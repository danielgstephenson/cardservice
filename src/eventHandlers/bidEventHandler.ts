import { toWords } from 'number-to-words'
import * as External from '../external'
import { State } from '../state'

export class BidEventHandler {
  state: State

  constructor (state: State) {
    this.state = state
  }

  handle (event: External.BidEvent): void {
    const state = this.state
    if (event.phase !== state.phase) {
      throw new Error(`processBidEvent: this.phase === ${state.phase}`)
    }
    const player = state.players[event.userId]
    if (player == null) {
      throw new Error(`handlePlanEvent: missing player ${event.userId}`)
    }
    if (player.withdrawn) {
      throw new Error(`processBidEvent: player ${player.id} is withdrawn.`)
    }
    if (player.auctionReady) {
      throw new Error(`processBidEvent: player ${player.id} is auctionReady.`)
    }
    if (player.bid > event.bid) {
      let message = `processBidEvent: player ${player.id} bid ${event.bid}, `
      message += `which is less than their previous bid of ${player.bid}.`
      throw new Error(message)
    }
    const money = player.majorMoney + player.minorMoney
    if (event.bid > money) {
      let message = `processBidEvent: player ${player.id} bid ${event.bid}, `
      message += `which is more than their total money of ${money}.`
      throw new Error(message)
    }
    const playerArray = Object.values(state.players)
    playerArray.forEach(p => { p.auctionReady = false })
    const bid = toWords(event.bid)
    state.history.addPublicChild(`${player.name} bids ${bid}.`)
    player.bid = event.bid
  }
}
