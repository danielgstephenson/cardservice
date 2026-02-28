import Rand from 'rand-seed'
import * as External from './external'
import { Phase, Input } from './external'
import { Player } from './player'
import { Episode } from './episode'
import { Card } from './card'
import { History } from './history'
import { setup } from './setup'
import { CardGroup } from './cardGroup/cardGroup'
import { InputEventHandler } from './eventHandlers/inputEventHandler'
import { arrayToString, playersToString } from './translate'
import { unique } from './math'
import { Auction } from './auction'

export class State {
  startTime: number
  rand: Rand
  market = new CardGroup()
  archive = new CardGroup()
  center = new CardGroup()
  auction = new Auction(this)
  inputEventHandler = new InputEventHandler(this)
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
    this.input.events.forEach(event => this.inputEventHandler.handle(event))
  }

  advanceRound (): void {
    this.round += 1
    this.phase = 'play'
    const players = Object.values(this.players)
    players.forEach(player => {
      player.auctionReady = false
      player.playReady = false
      player.bid = 0
    })
    const message = `Round ${this.round} begins.`
    this.history.addPublicChild(message)
    if (this.center.array.length > 1) return
    // const names = this.input.names
    if (this.center.array.length === 0) {
      // Public: The ${names.center} is empty, so this is the final play phase.
      // Players: Choose one final ${names.card} to ${names.exile} and one final ${names.card} to play
      // Spectators: Everyone is choosing one final ${names.card} to ${names.exile} and one final ${pnames.card} to play
      // return
    }
    // CASE 3
    // Public: The ${names.center} has only 1 card left, so this might be the final play phase
    // Players: Choose what might be your final ${names.card} to ${names.exile} and play
    // Spectators: Everyone is choosing what might be their final ${names.card} to ${names.exile} play
  }

  endGame (): void {
    const names = this.input.names
    const players = Object.values(this.players)
    const scores = players.map(player => player.getScore())
    const maxScore = Math.max(...scores)
    const winners = players.filter(player => player.getScore() === maxScore)
    const losers = players.filter(player => player.getScore() !== maxScore)
    this.phase = 'end'
    const endEpisode = this.history.addChild()
    endEpisode.addPublicChild(`The ${names.empress} is in the ${names.market}, so the game ends.`)
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

  getCard (id: string): Card {
    const card = this.cards[id]
    if (card == null) {
      throw new Error(`getCard: missing card ${id}`)
    }
    return card
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

  playCards (): void {
    const players = Object.values(this.players)
    const groupId = Math.random().toString()
    players.forEach(player => {
      const card = player.playArea.array[0]
      player.play(card, groupId)
    })
  }
}
