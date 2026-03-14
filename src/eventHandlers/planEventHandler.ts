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
    if (state.phase !== 'play') {
      throw new Error('handlePlanEvent: this.phase !== "play"')
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
    planEpisode.addPrivateChild(player, `You played ${event.playCard.rank}.`)
    const trashCard = state.getCard(event.trashCard.id)
    player.trash(trashCard, true)
    const playCard = state.getCard(event.playCard.id)
    player.playArea.add(playCard)
    const newHandMessage = `Your hand becomes ${cardsToString(player.hand.array)}.`
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
    state.playCards()
    this.scandal()
    if (state.phase === 'end') return
    state.auction.start()
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
        eyesMessage += `not more than the ${players.length} players, so ${names.timeDoesNotPass} `
        eyesMessage += `and only ${centerCard0.rank} ${names.isAddedToMarket}.`
      }
    }
    const newCenterMessage = `The ${names.center} becomes ${cardsToString(state.center.array)}.`
    const scandalEpisode = state.history.addPublicChild(eyesMessage)
    const groupId = crypto.randomUUID()
    players.forEach(player => {
      const card = player.playArea.array[0]
      if (card == null) throw new Error('scandal: playCard == null')
      const privateMessage = `You played ${card.rank} with ${card.charge} ${names.charges}.`
      let publicMessage = `${player.name} played ${card.rank}`
      publicMessage += ` with ${card.charge} ${names.charges}.`
      const chargeEpisode = scandalEpisode.addYouChild(
        player,
        privateMessage,
        publicMessage,
        player.id
      )
      chargeEpisode.groupId = groupId
    })
    scandalEpisode.addPublicChild(oldCenterMessage)
    scandalEpisode.addPublicChild(newCenterMessage)
  }
}
