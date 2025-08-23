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
    playerArray.forEach(player => this.discard(player, groupId, event))
  }

  discard (player: Player, groupId: string, event: External.TakeEvent): void {
    const state = this.state
    const history = state.history
    const names = state.input.names
    const oldDeckString = cardsToString(player.deck.array)
    const playCards = player.playArea.array
    const winner = player.id === event.playerId
    const auctionCards = winner ? event.cardIds.map(id => state.cards[id]) : []
    const newCards = [...playCards, ...auctionCards]
    newCards.sort((a, b) => a.rank - b.rank)
    newCards.forEach(card => player.deck.add(card))
    const newDeckString = cardsToString(player.deck.array)
    const privateMessage = `Your ${names.deck} becomes ${newDeckString}`
    const publicMessage = `${player.name}'s ${names.deck} becomes ${newDeckString}.`
    const discardEpisode = history.addYouChild(player, privateMessage, publicMessage, player.id)
    discardEpisode.groupId = groupId
    const privateOldMessage = `Your ${names.deck} was ${oldDeckString}`
    const publicOldMessage = `${player.name}'s ${names.deck} was ${oldDeckString}.`
    discardEpisode.addYouChild(player, privateOldMessage, publicOldMessage, player.id)
    // Add the second child where we talk about where the new cards came from
  }
}
