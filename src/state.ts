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
    this.startingEpisode = this.history.addChild()
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
    const publicMessage = `${player.name} is ready!`
    const privateMessage = 'You are ready.'
    const planEpisode = this.history.addYouChild(player, privateMessage, publicMessage)
    const oldHandMessage = `Your hand was ${cardsToString(player.hand.array)}`
    planEpisode.addPrivateChild(player, oldHandMessage)
    const handIds = player.hand.array.map(card => card.id)
    console.log('handIds', handIds)
    const playCard = this.getCard(event.playCard.id)
    const trashCard = this.getCard(event.trashCard.id)
    player.playArea.add(playCard)
    player.trash.add(trashCard)
    const newHandMessage = `Your hand becomes ${cardsToString(player.hand.array)}`
    planEpisode.addPrivateChild(player, newHandMessage)
    player.playReady = true
    const playerArray = Object.values(this.players)
    if (playerArray.some(player => !player.playReady)) return
    this.history.addPublicChild('Everyone is ready.', player.id)
    playerArray.forEach(trashPlayer => {
      const trashRank = trashPlayer.trash.array[trashPlayer.trash.array.length - 1].rank
      const trashMessage = `You ${this.input.names.trash} ${trashRank}`
      this.history.addPrivateChild(trashPlayer, trashMessage)
    })
    this.scandal()
    this.playCards()
  }

  playCards (): void {
    const players = Object.values(this.players)
    players.forEach(player => {
      const card = player.playArea.array[0]
      card.play(player)
    })
    // Do the powers on each player's card
    // Check to see if the game ends
    // Otherwise, card from the palace goes to the auction
    // The highest rank cards go to market or dungeon
    // announce bonus powers
    // begin the auction
  }

  scandal (): void {
    const players = Object.values(this.players)
    const playedCards = this.getPlayedCards()
    const totalCharge = playedCards.reduce((total, card) => total + card.charge, 0)
    const names = this.input.names
    let eyesMessage = `There are ${totalCharge} total ${names.charges}, `
    if (totalCharge > players.length) {
      const centerCard = this.center.array[0]
      if (centerCard == null) {
        this.market.add(centerCard)
        eyesMessage += `but the ${names.center} is empty because the game is ending.`
      } else {
        eyesMessage += `more that the ${players.length} players, so ${centerCard.rank} ${names.isAddedToMarket}.`
      }
    } else {
      eyesMessage += `not more than the ${players.length} players, so ${names.timeDoesNotPass}.`
    }
    this.history.addPublicChild(eyesMessage)
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
