import * as External from '../external'
import { cardsToString } from '../translate'
import { State } from '../state'
import { addPlayedEpisodes } from '../powers/addPlayedEpisodes'

export class PlanEventHandler {
  state: State

  constructor (state: State) {
    this.state = state
  }

  handle (event: External.PlanEvent): void {
    const state = this.state
    if (state.phase !== 'play') {
      throw new Error('handlePlanEvent: this.phase !== "play"')
    }
    if (event.playCard.id === event.trashCard.id) {
      throw new Error('handlePlanEvent: event.playCard.id === event.trashCard.id')
    }
    const player = state.players[event.playerId]
    if (player == null) {
      throw new Error(`handlePlanEvent: missing player ${event.playerId}`)
    }
    const handSize = player.hand.array.length - 2
    let publicMessage = `${player.name} is ready `
    let privateMessage = 'You are ready '
    if (handSize < 3) {
      publicMessage += 'and draws up to 3.'
      privateMessage += 'and you draw up to 3.'
    }
    if (handSize >= 3) {
      publicMessage += `and already has ${handSize} cards in hand.`
      privateMessage += `and you already have ${handSize} cards in hand.`
    }
    const planEpisode = state.history.addYouChild(player, privateMessage, publicMessage)
    const oldHandMessage = `Your hand was ${cardsToString(player.hand.array)}.`
    planEpisode.addPrivateChild(player, oldHandMessage)
    planEpisode.addPrivateChild(player, `You play ${event.playCard.rank}.`)
    const trashCard = state.getCard(event.trashCard.id)
    player.trash(trashCard, planEpisode)
    const playCard = state.getCard(event.playCard.id)
    player.playArea.add(playCard)
    const newHandMessage = `Your hand becomes ${cardsToString(player.hand.array)}.`
    planEpisode.addPrivateChild(player, newHandMessage)
    player.playReady = true
    const playerArray = Object.values(state.players)
    player.drawUpToThree(planEpisode)
    if (playerArray.every(player => player.playReady)) {
      this.onAllReady(event)
    }
  }

  onAllReady (event: External.PlanEvent): void {
    const state = this.state
    state.history.addPublicChild('Everyone is ready.')
    state.playCards()
    this.scandal(event)
    if (state.phase === 'end') return
    state.auction.start()
  }

  scandal (event: External.PlanEvent): void {
    const state = this.state
    const players = Object.values(state.players)
    const playedCards = state.getPlayedCards()
    const totalCharge = playedCards.reduce((total, card) => total + card.charge, 0)
    const names = state.input.names
    let eyesMessage = `There are ${totalCharge} total ${names.charges}, `
    const oldCenterMessage = `The ${names.center} was ${cardsToString(state.center.array)}.`
    const oldMarketMessage = `The ${names.market} was ${cardsToString(state.market.array)}.`
    if (totalCharge > players.length) {
      const centerCard0 = state.center.array[0]
      const centerCard1 = state.center.array[1]
      if (centerCard0 == null) {
        eyesMessage += `more than the ${players.length} players `
        eyesMessage += `but only ${names.empress} remains in the ${names.center} `
        eyesMessage += `so ${names.empress} ${names.isAddedToMarket}.`
        state.endGame()
      } else if (centerCard1 == null) {
        state.market.add(centerCard0)
        eyesMessage += `more than the ${players.length} players, so ${names.timeDoesPass} `
        eyesMessage += `and ${centerCard0.rank} and ${names.empress} ${names.areAddedToMarket}.`
        state.endGame()
      } else {
        state.market.add(centerCard0)
        state.market.add(centerCard1)
        eyesMessage += `more than the ${players.length} players, so ${names.timeDoesPass} `
        eyesMessage += `and ${centerCard0.rank} and ${centerCard1.rank} ${names.areAddedToMarket}.`
      }
    } else {
      const centerCard0 = state.center.array[0]
      if (centerCard0 == null) {
        eyesMessage += `not more than the ${players.length} players, `
        eyesMessage += `but only ${names.empress} remains in the ${names.center} `
        eyesMessage += `so ${names.empress} ${names.isAddedToMarket}.`
        state.endGame()
      } else {
        state.market.add(centerCard0)
        eyesMessage += `not more than the ${players.length} players, so ${names.timeDoesNotPass} `
        eyesMessage += `and only ${centerCard0.rank} ${names.isAddedToMarket}.`
      }
    }
    const newCenterMessage = `The ${names.center} becomes ${cardsToString(state.center.array)}.`
    const newMarketMessage = `The ${names.market} becomes ${cardsToString(state.market.array)}.`
    const scandalEpisode = state.history.addPublicChild(eyesMessage)
    const player = state.players[event.playerId]
    addPlayedEpisodes(scandalEpisode, player, { charge: true })
    scandalEpisode.addPublicChild(oldCenterMessage)
    scandalEpisode.addPublicChild(newCenterMessage)
    scandalEpisode.addPublicChild(oldMarketMessage)
    scandalEpisode.addPublicChild(newMarketMessage)
  }
}
