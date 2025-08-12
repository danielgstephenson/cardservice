import * as External from '../external'
import { cardsToString } from '../translate'
import { State } from '../state'

export class PlanEventHandler {
  state: State

  constructor (state: State) {
    this.state = state
  }

  handle (event: External.PlanEvent): void {
    const state = this.state
    if (event.phase !== state.phase) {
      throw new Error(`handlePlanEvent: this.phase === ${state.phase}`)
    }
    const player = state.players[event.userId]
    if (player == null) {
      throw new Error(`handlePlanEvent: missing player ${event.userId}`)
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
    const oldHandMessage = `Your hand was ${cardsToString(player.hand.array)}`
    planEpisode.addPrivateChild(player, oldHandMessage)
    const trashCard = state.getCard(event.trashCard.id)
    player.trash(trashCard, true)
    const playCard = state.getCard(event.playCard.id)
    player.playArea.add(playCard)
    const newHandMessage = `Your hand becomes ${cardsToString(player.hand.array)}`
    planEpisode.addPrivateChild(player, newHandMessage)
    player.playReady = true
    const playerArray = Object.values(state.players)
    player.drawUpToThree(planEpisode)
    if (playerArray.every(player => player.playReady)) {
      this.onAllReady()
    }
  }

  onAllReady (): void {
    const state = this.state
    const playerArray = Object.values(state.players)
    state.history.addPublicChild('Everyone is ready.')
    playerArray.forEach(player => {
      const trashCard = player.trashArea.array[0]
      if (trashCard == null) throw new Error('onAllReady: trashCard == null')
      player.addTrashEpisode(trashCard)
    })
    this.scandal()
    state.playCards()
    state.checkEnd()
  }

  scandal (): void {
    const state = this.state
    const players = Object.values(state.players)
    const playedCards = state.getPlayedCards()
    const totalCharge = playedCards.reduce((total, card) => total + card.charge, 0)
    const names = state.input.names
    let eyesMessage = `There are ${totalCharge} total ${names.charges}, `
    const oldCenterMessage = `The ${names.center} was ${cardsToString(state.center.array)}.`
    if (totalCharge > players.length) {
      const centerCard = state.center.array[0]
      if (centerCard == null) {
        eyesMessage += `but the ${names.center} is empty because the game is ending.`
      } else {
        state.market.add(centerCard)
        eyesMessage += `more that the ${players.length} players, so ${centerCard.rank} ${names.isAddedToMarket}.`
      }
    } else {
      eyesMessage += `not more than the ${players.length} players, so ${names.timeDoesNotPass}.`
    }
    const newCenterMessage = `The ${names.center} becomes ${cardsToString(state.center.array)}.`
    const scandalEpisode = state.history.addPublicChild(eyesMessage)
    players.forEach(player => {
      const card = player.playArea.array[0]
      if (card == null) throw new Error('scandal: playCard == null')
      const message = `You played ${card.rank} with ${card.charge} ${names.charges}.`
      scandalEpisode.addPrivateChild(player, message)
    })
    players.forEach(player => {
      const card = player.playArea.array[0]
      if (card == null) throw new Error('scandal: playCard == null')
      const message = `${player.name} played ${card.rank} with ${card.charge} ${names.charges}.`
      scandalEpisode.addOthersChild(player, message)
    })
    scandalEpisode.addPublicChild(oldCenterMessage)
    scandalEpisode.addPublicChild(newCenterMessage)
  }
}
