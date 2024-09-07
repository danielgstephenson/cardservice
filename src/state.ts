import Rand from 'rand-seed'
import * as External from './external'
import { Phase, Input } from './external'
import { Player } from './player'
import { Episode } from './episode'
import { Card } from './card'
import { History } from './history'
import { setup } from './setup'
import { CardGroup } from './cardGroup'

export class State {
  startTime: number
  rand: Rand
  market = new CardGroup()
  archive = new CardGroup()
  center = new CardGroup()
  players = new Map<string, Player>()
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
  startingReserve: Card[] = []
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
    this.center = new CardGroup(this.startingArchive)
    this.market = new CardGroup(this.startingMarket)
  }
}
