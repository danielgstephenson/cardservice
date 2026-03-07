import * as External from '../external'
import { State } from '../state'

export class ConcedeEventHandler {
  state: State

  constructor (state: State) {
    this.state = state
  }

  handle (event: External.ConcedeEvent): void {
    const state = this.state
    if (state.phase !== 'auction') {
      throw new Error('processConcedeEvent: this.phase !== "auction"')
    }
    const player = state.players[event.playerId]
    if (player == null) {
      throw new Error(`processConcedeEvent: missing player ${event.playerId}`)
    }
    if (player.withdrawn) {
      throw new Error(`processConcedeEvent: player ${player.id} is withdrawn.`)
    }
    if (player.auctionReady) {
      throw new Error(`processConcedeEvent: player ${player.id} is auctionReady.`)
    }
    const playerArray = Object.values(state.players)
    const bids = playerArray.map(p => p.bid)
    const bidCounts = bids.map(bid => {
      return bids.filter(b => b === bid).length
    })
    if (Math.min(...bidCounts) > 1) {
      throw new Error('processConcedeEvent: no untied bids.')
    }
    const untiedBids = bids.filter(bid => {
      return bids.filter(b => b === bid).length === 1
    })
    if (untiedBids.length === 0) {
      throw new Error('processConcedeEvent: no untied bid.')
    }
    if (player.bid === Math.max(...untiedBids)) {
      throw new Error(`processConcedeEvent: player ${player.id} has the highest untied bid.`)
    }
    player.auctionReady = true
    const publicConcedeMessage = `${player.name} is ready to concede the auction.`
    const privateConcedeMessage = 'You are ready to concede the auction.'
    state.history.addYouChild(player, privateConcedeMessage, publicConcedeMessage)
    const highestUntiedBid = Math.max(...untiedBids)
    const winner = playerArray.find(p => p.bid === highestUntiedBid)
    if (winner == null) {
      throw new Error('processConcedeEvent: winner is undefined.')
    }
    if (winner.id === player.id) {
      throw new Error('processConcedeEvent: the highest untied bidded is trying to concede.')
    }
    const losers = playerArray.filter(p => p.id !== winner.id)
    const readyToEndAuction = losers.every(p => p.auctionReady)
    if (!readyToEndAuction) return
    let privateMessage = 'Everyone is ready, so '
    privateMessage += `you pay ${highestUntiedBid}.`
    let publicMessage = 'Everyone is ready, so '
    publicMessage += `${winner.name} pays ${highestUntiedBid}.`
    const allReadyEpisode = state.history.addYouChild(winner, privateMessage, publicMessage)
    winner.pay(highestUntiedBid, allReadyEpisode)
  }
}
