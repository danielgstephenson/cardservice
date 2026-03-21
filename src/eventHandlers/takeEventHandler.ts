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
    if (event.playerId !== winner.id) {
      throw new Error('handleTakeEvent: event.userId !== winner.userId')
    }
    event.cardIds.forEach(cardId => {
      const someMarketMatch = state.market.array.some(card => card.id === cardId)
      if (!someMarketMatch) {
        throw new Error(`handleTakeEvent: ${cardId} is not in the market.`)
      }
    })
    const takenCards = event.cardIds.map(cardId => state.getCard(cardId))
    takenCards.sort((a, b) => a.rank - b.rank)
    const stringCards = takenCards.length === 0 ? 'nothing' : cardsToString(takenCards)
    const names = state.input.names
    const takePrivateMessage = `You took ${stringCards} from the ${names.market}.`
    const player = state.players[event.playerId]
    const takePublicMessage = `${player.name} took ${stringCards} from the ${names.market}.`
    state.history.addYouChild(player, takePrivateMessage, takePublicMessage)
    const leftOverCards = this.state.market.array.filter(card => !takenCards.includes(card))
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
    this.state.advanceRound()
  }

  discard (player: Player, groupId: string, event: External.TakeEvent): void {
    const state = this.state
    const history = state.history
    const names = state.input.names
    const oldDeckString = cardsToString(player.deck.array)
    const playCards = player.playArea.array
    const winner = player.id === event.playerId
    const auctionCards = winner ? event.cardIds.map(id => state.cards[id]) : []
    auctionCards.sort((a, b) => a.rank - b.rank)
    const newCards = [...auctionCards, ...playCards]
    player.deck.addCards(newCards)
    const newDeckString = cardsToString(player.deck.array)
    if (newCards.length === 0) {
      const privateMessage = `Your ${names.deck} remains ${newDeckString}.`
      const publicMessage = `${player.name}'s ${names.deck} remains ${newDeckString}.`
      const discardEpisode = history.addYouChild(player, privateMessage, publicMessage, player.id)
      discardEpisode.groupId = groupId
      return
    }
    const privateMessage = `Your ${names.deck} becomes ${newDeckString}.`
    const publicMessage = `${player.name}'s ${names.deck} becomes ${newDeckString}.`
    const discardEpisode = history.addYouChild(player, privateMessage, publicMessage, player.id)
    discardEpisode.groupId = groupId
    const privateOldMessage = `Your ${names.deck} was ${oldDeckString}`
    const publicOldMessage = `${player.name}'s ${names.deck} was ${oldDeckString}.`
    discardEpisode.addYouChild(player, privateOldMessage, publicOldMessage, player.id)
    if (winner) {
      const boughtRanks = cardsToString(auctionCards)
      const onlyOne = boughtRanks.length === 1
      const orderString = onlyOne ? '' : ' from lowest to highest'
      const are = onlyOne ? 'is' : 'are'
      let privateMessage = `The ${boughtRanks} you bought ${are} added to`
      privateMessage += ` your ${names.deck}${orderString}.`
      let publicMessage = `The ${boughtRanks} ${player.name} bought ${are} added to`
      publicMessage += ` their ${names.deck}${orderString}.`
      discardEpisode.addYouChild(player, privateMessage, publicMessage, player.id)
    }
    const arrested = playCards.length === 0
    if (!arrested) {
      const rank = playCards[0].rank
      const privateMessage = `The ${rank} you ${names.played} is added to your deck.`
      const publicMessage = `The ${rank} ${player.name} ${names.played} is added to their deck.`
      discardEpisode.addYouChild(player, privateMessage, publicMessage, player.id)
    }
  }
}
