import * as External from '../external'
import { arrayToString, cardsToString, isAre, playersToString } from '../translate'
import { unique } from '../math'
import { Player } from '../player'
import { State } from '../state'

export class PlanEventHandler {
  state: State

  constructor (state: State) {
    this.state = state
  }

  checkEnd (): void {
    const state = this.state
    const gameIsEnding = state.center.array.length === 0
    if (gameIsEnding) this.endGame()
    else this.startAuction()
  }

  endGame (): void {
    const state = this.state
    const players = Object.values(state.players)
    const scores = players.map(player => player.getScore())
    const maxScore = Math.max(...scores)
    const winners = players.filter(player => player.getScore() === maxScore)
    const losers = players.filter(player => player.getScore() !== maxScore)
    const endEpisode = state.history.addChild()
    const publicMessage =
        winners.length === 1
          ? `${winners[0].name} wins.`
          : `${playersToString(winners)} tie for the win.`
    endEpisode.spectateMessage = publicMessage
    losers.forEach(loser => {
      endEpisode.messages[loser.id] = publicMessage
    })
    winners.forEach(winner => {
      const otherWinners = winners.filter(other => other.name !== winner.name)
      const names = otherWinners.map(other => other.name)
      names.unshift('You')
      const winnerString = arrayToString(names)
      const message =
          names.length > 1
            ? `${winnerString} tie for the win.`
            : 'You win.'
      endEpisode.messages[winner.id] = message
    })
    const uniqueScores = unique(scores)
    uniqueScores.sort((a, b) => a - b)
    uniqueScores.forEach(score => {
      const groupId = `EndScore${score}`
      const scorePlayers = players.filter(p => p.getScore() === score)
      scorePlayers.forEach(player => {
        const privateMessage = `Your score is ${score}.`
        const publicMessage = `${player.name}'s score is ${score}.`
        const scoreEpisode = endEpisode.addYouChild(player, privateMessage, publicMessage)
        scoreEpisode.groupId = groupId
        // ADD THE CHILDREN OF THE SCORE EPISODE
      })
    })
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
    this.checkEnd()
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

  startAuction (): void {
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
