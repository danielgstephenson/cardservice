import { Player } from './player'
import { State } from './state'
import { arrayToString, cardsToString, isAre, playersToString } from './translate'

export class Auction {
  state: State

  constructor (state: State) {
    this.state = state
  }

  start (): void {
    const state = this.state
    const names = state.input.names
    const palaceCard = state.center.array[0]
    if (palaceCard == null) {
      throw new Error('onAllReady: palaceCard == null')
    }
    let publicMessage = 'The palace is not empty, so the lowest rank palace card, '
    publicMessage += `${palaceCard.rank} ${names.isAddedToMarket}.`
    const palaceEpisode = state.history.addPublicChild(publicMessage)
    const oldPalaceMessage = `The palace was ${cardsToString(state.center.array)}.`
    state.market.add(palaceCard)
    const newPalaceMessage = `The palace becomes ${cardsToString(state.center.array)}.`
    palaceEpisode.addPublicChild(oldPalaceMessage)
    palaceEpisode.addPublicChild(newPalaceMessage)
    const playCards = state.getPlayedCards()
    const maxRank = Math.max(...playCards.map(card => card.rank))
    const maxRankPlayCards = playCards.filter(card => card.rank >= maxRank)
    if (maxRankPlayCards.length === 1) {
      const maxRankCard = maxRankPlayCards[0]
      state.market.add(maxRankCard)
      const player = maxRankCard.player
      if (player == null) {
        throw new Error('startAuction: maxRankCard.player == null')
      }
      let privateMessage = `Your ${maxRankCard.rank} is the highest rank in play, `
      privateMessage += `so it ${names.isAddedToMarket}.`
      let publicMessage = `${player.name}'s ${maxRankCard.rank} is the highest rank in play, `
      publicMessage += `so it ${names.isAddedToMarket}.`
      const arrestEpisode = state.history.addYouChild(player, privateMessage, publicMessage)
      void arrestEpisode
      // ADD CHILDREN OF THE ARREST EPISODE
    } else {
      const arrestPlayers: Player[] = []
      const playerArray = Object.values(state.players)
      const oldDungeonCards = cardsToString(state.archive.array)
      maxRankPlayCards.forEach(card => {
        const player = card.player
        state.archive.add(card)
        if (player == null) {
          throw new Error('startAuction: card.player == null')
        }
        arrestPlayers.push(player)
      })
      const newDungeonCards = cardsToString(state.archive.array)
      const otherPlayers = playerArray.filter(player => !arrestPlayers.includes(player))
      const arrestEpisode = state.history.addChild()
      otherPlayers.forEach(player => {
        let message = `${playersToString(arrestPlayers)} played the highest rank, ${maxRank}, `
        message += `so they are ${names.archivedTo} the ${names.archive}.`
        arrestEpisode.messages[player.id] = message
      })
      arrestPlayers.forEach(player => {
        const otherArrestPlayers = arrestPlayers.filter(other => other.id !== player.id)
        const otherNames = otherArrestPlayers.map(other => other.name)
        const arrestNames = ['You', ...otherNames]
        let message = `${arrayToString(arrestNames)} played the highest rank, ${maxRank}, `
        message += `so they are ${names.archivedTo} the ${names.archive}.`
        arrestEpisode.messages[player.id] = message
      })
      const oldDungeonMessage = `The ${names.archive} was ${oldDungeonCards}.`
      const newDungeonMessage = `The ${names.archive} becomes ${newDungeonCards}.`
      arrestEpisode.addPublicChild(oldDungeonMessage)
      arrestEpisode.addPublicChild(newDungeonMessage)
    }
    // Announce Bonus Powers
    const auctionCards = cardsToString(state.market.array)
    let startAuctionMessage = `${auctionCards} ${isAre(state.archive.array)} up for `
    startAuctionMessage += `auction from the ${names.market}.`
    state.history.addPublicChild(startAuctionMessage)
    state.phase = 'auction'
  }
}
