import { Episode } from '../episode'
import * as External from '../external'
import { Player } from '../player'
import { State } from '../state'
import { cardsToString, isAre } from '../translate'

export class TakeEventHandler {
  state: State

  constructor (state: State) {
    this.state = state
  }

  handle (event: External.TakeEvent): void {
    const state = this.state
    if (state.phase !== 'auction') {
      throw new Error('handleTakeEvent: event.phase !== "auction"')
    }
    const playerArray = Object.values(state.players)
    const bids = playerArray.map(p => p.bid)
    const untiedBids = bids.filter(bid => {
      return bids.filter(b => b === bid).length === 1
    })
    if (untiedBids.length === 0) {
      throw new Error('handleTakeEvent: no untied bid.')
    }
    const highestUntiedBid = Math.max(...untiedBids)
    const winner = playerArray.find(p => p.bid === highestUntiedBid)
    if (winner == null) {
      throw new Error('handleTakeEvent: winner is undefined.')
    }
    console.log('ids:', event.playerId, winner.id)
    if (event.playerId !== winner.id) {
      throw new Error('handleTakeEvent: event.userId !== winner.userId')
    }
    event.cardIds.forEach(cardId => {
      const someMarketMatch = state.market.array.some(card => card.id === cardId)
      if (!someMarketMatch) {
        throw new Error(`handleTakeEvent: ${cardId} is not in the market.`)
      }
    })
    const cards = event.cardIds.map(cardId => state.getCard(cardId))
    const stringCards = cardsToString(cards)
    const names = state.input.names
    const takePrivateMessage = `You took ${stringCards} from the ${names.center}.`
    const player = state.players[event.playerId]
    const takePublicMessage = `${player.name} took ${stringCards} from the ${names.center}.`
    state.history.addYouChild(player, takePrivateMessage, takePublicMessage)
    cards.forEach(card => player.discard.add(card))
    const leftOverCards = this.state.market.array
    if (leftOverCards.length > 0) {
      const leftOverString = cardsToString(leftOverCards)
      const oldArchiveString = cardsToString(state.archive.array)
      leftOverCards.forEach(card => state.archive.add(card))
      const newArchiveString = cardsToString(state.archive.array)
      const cardsName = leftOverCards.length > 1 ? names.cards : names.card
      const are = isAre(leftOverCards)
      let dungeonMessage = `The remaining ${names.market} ${cardsName}, ${leftOverString}, `
      dungeonMessage += `${are} ${names.archivedTo} the ${names.archive}.`
      const dungeonEpisode = state.history.addPublicChild(dungeonMessage)
      const wasMessage = `The ${names.archive} was ${oldArchiveString}.`
      const becomesMessage = `The ${names.archive} becomes ${newArchiveString}.`
      dungeonEpisode.addPublicChild(wasMessage)
      dungeonEpisode.addPublicChild(becomesMessage)
    }
    const groupId = String(Math.random())
    playerArray.forEach(player => this.discard(player, groupId))
  }

  discard (player: Player, groupId: string): void {
    const state = this.state
    const privateMessage = 'You discard.'
    const publicMessage = `${player.name} discards.`
    const testEpisode = state.history.addYouChild(player, privateMessage, publicMessage, player.id)
    testEpisode.groupId = groupId
    // Replace the above test message with the real messages
  }
}
