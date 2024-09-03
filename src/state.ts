import Rand from 'rand-seed'
import * as External from './external'
import { Phase, Input } from './external'
import { Player } from './player'
import { Episode } from './episode'
import { Card } from './card'
import { History } from './history'
import { setup } from './setup'

export class State {
  startTime: number
  rand: Rand
  market: Card[] = []
  archive: Card[] = []
  center: Card[] = []
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
  startingReserve: Card[] = []
  startingArchive: Card[] = []

  constructor (input: External.Input) {
    this.input = input
    this.startTime = Date.now()
    input.players.forEach(inputPlayer => {
      const player = new Player(this, inputPlayer)
      this.players.set(player.id, player)
    })
    this.rand = new Rand(input.seed)
    this.history = new History(this)
    setup(this)
  }
}
