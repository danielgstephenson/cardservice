import Rand from 'rand-seed'
import * as External from './external'
import { Phase, Input } from './external'
import { Player } from './player'
import { Episode } from './episode'
import { Card } from './card'
import { History } from './history'
import { setup } from './setup'
import { CardGroup } from './cardGroup/cardGroup'
import { arrayToString, cardsToString, playersToString } from './translate'
import { unique } from './math'

export class State {
  startTime: number
  rand: Rand
  market = new CardGroup()
  archive = new CardGroup()
  center = new CardGroup()
  players: Record<string, Player> = {}
  cards: Record<string, Card> = {}
  history: History
  round = 1
  lastMessageRound = 0
  phase: Phase = 'play'
  extraMarket = false
  playTied = false
  input: Input
  startingEpisode: Episode
  startingHand: Card[] = []
  startingMarket: Card[] = []
  startingDeck: Card[] = []
  startingArchive: Card[] = []
  startingCenter: Card[] = []

  constructor (input: External.Input) {
    this.input = input
    this.startTime = Date.now()
    this.rand = new Rand(input.seed)
    input.players.forEach(inputPlayer => new Player(this, inputPlayer))
    this.history = new History(this)
    this.history.spectateMessage = 'History'
    input.players.forEach(player => { this.history.messages[player.id] = 'History' })
    this.startingEpisode = this.history.addPublicChild('Starting Episode')
    setup(this)
    this.archive = new CardGroup(this.startingArchive)
    this.archive.label = 'archive'
    this.center = new CardGroup(this.startingCenter)
    this.center.label = 'center'
    this.market = new CardGroup(this.startingMarket)
    this.market.label = 'market'
    this.input.events.forEach(event => this.processEvent(event))
  }

  getCard (id: string): Card {
    const card = this.cards[id]
    if (card == null) {
      throw new Error(`getCard: missing card ${id}`)
    }
    return card
  }

  processEvent (event: External.InputEvent): void {
    if (event.type === 'plan') {
      this.processPlanEvent(event)
    }
  }

  processPlanEvent (event: External.PlanEvent): void {
    if (event.phase !== this.phase) {
      throw new Error(`handlePlanEvent: this.phase === ${this.phase}`)
    }
    const player = this.players[event.userId]
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
    const planEpisode = this.history.addYouChild(player, privateMessage, publicMessage)
    const oldHandMessage = `Your hand was ${cardsToString(player.hand.array)}`
    planEpisode.addPrivateChild(player, oldHandMessage)
    const trashCard = this.getCard(event.trashCard.id)
    player.trash(trashCard, true)
    const playCard = this.getCard(event.playCard.id)
    player.playArea.add(playCard)
    const newHandMessage = `Your hand becomes ${cardsToString(player.hand.array)}`
    planEpisode.addPrivateChild(player, newHandMessage)
    player.playReady = true
    const playerArray = Object.values(this.players)
    player.drawUpToThree(planEpisode)
    if (playerArray.every(player => player.playReady)) {
      this.onAllReady()
    }
  }

  onAllReady (): void {
    const playerArray = Object.values(this.players)
    this.history.addPublicChild('Everyone is ready.')
    playerArray.forEach(player => {
      const trashCard = player.trashArea.array[0]
      if (trashCard == null) throw new Error('onAllReady: trashCard == null')
      player.addTrashEpisode(trashCard)
    })
    this.scandal()
    this.playCards()
    this.checkEnd()
  }

  playCards (): void {
    const players = Object.values(this.players)
    const groupId = Math.random().toString()
    players.forEach(player => {
      const card = player.playArea.array[0]
      player.play(card, groupId)
    })
  }

  checkEnd (): void {
    const gameIsEnding = this.center.array.length === 0
    if (gameIsEnding) this.endGame()
    else this.startAuction()
  }

  startAuction (): void {
    const names = this.input.names
    const palaceCard = this.center.array[0]
    if (palaceCard == null) {
      throw new Error('onAllReady: palaceCard == null')
    }
    let publicMessage = 'The palace is not empty, so the lowest rank palace card, '
    publicMessage += `${palaceCard.rank} ${names.isAddedToMarket}.`
    const palaceEpisode = this.history.addPublicChild(publicMessage)
    const oldPalaceMessage = `The palace was ${cardsToString(this.center.array)}.`
    this.market.add(palaceCard)
    const newPalaceMessage = `The palace becomes ${cardsToString(this.center.array)}.`
    palaceEpisode.addPublicChild(oldPalaceMessage)
    palaceEpisode.addPublicChild(newPalaceMessage)
    const playCards = this.getPlayedCards()
    const maxRank = Math.max(...playCards.map(card => card.rank))
    const maxRankPlayCards = playCards.filter(card => card.rank >= maxRank)
    if (maxRankPlayCards.length === 1) {
      const maxRankCard = maxRankPlayCards[0]
      this.market.add(maxRankCard)
      const player = maxRankCard.player
      if (player == null) {
        throw new Error('startAuction: maxRankCard.player == null')
      }
      let privateMessage = `Your ${maxRankCard.rank} is the highest rank in play, `
      privateMessage += `so it ${names.isAddedToMarket}.`
      let publicMessage = `${player.name}'s ${maxRankCard.rank} is the highest rank in play, `
      publicMessage += `so it ${names.isAddedToMarket}.`
      const arrestEpisode = this.history.addYouChild(player, privateMessage, publicMessage)
      void arrestEpisode
      // ADD CHILDREN OF THE ARREST EPISODE
    } else {
      const arrestPlayers: Player[] = []
      const playerArray = Object.values(this.players)
      maxRankPlayCards.forEach(card => {
        const player = card.player
        this.archive.add(card)
        if (player == null) {
          throw new Error('startAuction: card.player == null')
        }
        arrestPlayers.push(player)
      })
      const otherPlayers = playerArray.filter(player => !arrestPlayers.includes(player))
      const arrestEpisode = this.history.addChild()
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
      // ADD CHILDREN OF THE ARREST EPISODE
    }
    // The highest rank cards go to market or dungeon
    // announce bonus powers
    // begin the auction
    // Note: messages will vary between playing and copying
  }

  endGame (): void {
    const players = Object.values(this.players)
    const scores = players.map(player => player.getScore())
    const maxScore = Math.max(...scores)
    const winners = players.filter(player => player.getScore() === maxScore)
    const losers = players.filter(player => player.getScore() !== maxScore)
    const endEpisode = this.history.addChild()
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

  scandal (): void {
    const players = Object.values(this.players)
    const playedCards = this.getPlayedCards()
    const totalCharge = playedCards.reduce((total, card) => total + card.charge, 0)
    const names = this.input.names
    let eyesMessage = `There are ${totalCharge} total ${names.charges}, `
    const oldCenterMessage = `The ${names.center} was ${cardsToString(this.center.array)}.`
    if (totalCharge > players.length) {
      const centerCard = this.center.array[0]
      if (centerCard == null) {
        eyesMessage += `but the ${names.center} is empty because the game is ending.`
      } else {
        this.market.add(centerCard)
        eyesMessage += `more that the ${players.length} players, so ${centerCard.rank} ${names.isAddedToMarket}.`
      }
    } else {
      eyesMessage += `not more than the ${players.length} players, so ${names.timeDoesNotPass}.`
    }
    const newCenterMessage = `The ${names.center} becomes ${cardsToString(this.center.array)}.`
    const scandalEpisode = this.history.addPublicChild(eyesMessage)
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

  getPlayedCards (): Card[] {
    const players = Object.values(this.players)
    const playedCards = players.map(player => {
      const card = player.playArea.array[0]
      if (card == null) {
        throw new Error(`playCards: player ${player.id} has no card in their play area.`)
      }
      return card
    })
    return playedCards
  }
}
