import Rand from 'rand-seed'
import * as External from './external'
import { Phase, Input } from './external'
import { Player } from './player'
import { Episode } from './episode'
import { Card } from './card'
import { History } from './history'
import { setup } from './setup'
import { CardGroup } from './cardGroup/cardGroup'
import { cardsToString } from './translate'

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
  startingEpisode?: Episode
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
    setup(this)
    this.archive = new CardGroup(this.startingArchive)
    this.archive.label = 'archive'
    this.center = new CardGroup(this.startingArchive)
    this.center.label = 'center'
    this.market = new CardGroup(this.startingMarket)
    this.market.label = 'market'
    console.log('events', input.events)
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
    const oldHandMessage = `Your hand was ${cardsToString(player.hand.array)}`
    const handIds = player.hand.array.map(card => card.id)
    console.log('handIds', handIds)
    const playCard = this.getCard(event.playCard.id)
    const trashCard = this.getCard(event.trashCard.id)
    player.play.add(playCard)
    player.trash.add(trashCard)
    const newHandMessage = `Your hand becomes ${cardsToString(player.hand.array)}`
    const publicMessage = `${player.name} is ready!`
    this.history.addPublicChild(publicMessage, player.id)
    this.history.addOthersChild(publicMessage, [player], player.id)
    const privateMessage = 'You are ready.'
    const privateEpisode = this.history.addPrivateChild(privateMessage, [player])
    privateEpisode.addPrivateChild(oldHandMessage, [player])
    privateEpisode.addPrivateChild(newHandMessage, [player])
    player.playReady = true
    const playerArray = Object.values(this.players)
    if (playerArray.some(player => !player.playReady)) return
    this.history.addBroadcastChild('Everyone is ready.', player.id)
    playerArray.forEach(p => {
      const trashRank = p.trash.array[p.trash.array.length - 1].rank
      const trashMessage = `You ${this.input.names.trash} ${trashRank}`
      this.history.addPrivateChild(trashMessage, [p])
    })
  }

  playCards (): void {
    // Check to see if there are enough eyes
    // If so, the scandal occurs
    // Do the powers on each player's card
    // Check to see if the game ends
    // Otherwise, card from the palace goes to the auction
    // The highest rank cards go to market or dungeon
    // announce bonus powers
    // begin the auction
  }
}
