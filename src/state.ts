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

export class State {
  startTime: number
  rand: Rand
  market = new CardGroup()
  archive = new CardGroup()
  center = new CardGroup()
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

  getCard (id: string): Card {
    const card = this.cards[id]
    if (card == null) {
      throw new Error(`getCard: missing card ${id}`)
    }
    return card
  }

  playCards (): void {
    const players = Object.values(this.players)
    const groupId = Math.random().toString()
    players.forEach(player => {
      const card = player.playArea.array[0]
      player.play(card, groupId)
    })
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
