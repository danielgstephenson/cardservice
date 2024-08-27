import Rand from 'rand-seed'
import * as External from './external'
import {Card, Phase, Input} from './external'
import { Player } from './player'
import { range, shuffle } from './math'
import { Episode } from './episode'

export class State {
  startTime: number
  rand: Rand
  market: Card[] = []
  archive: Card[] = []
  center: Card[] = []
  players = new Map<string,Player>()
  history: Episode[] = []
  round = 1
  lastMessageRound = 0
  phase: Phase = 'play'
  extraMarket = false
  playTied = false
  input: Input

  constructor(input: External.Input) {
    this.input = input
    this.startTime = Date.now()
    input.players.forEach(inputPlayer => {
      const player = new Player(input, inputPlayer)
      this.players.set(player.id, player)
    })
    const playerIds = input.players.map(player => player.id)
    const seed = playerIds.join('')
    this.rand = new Rand(seed)
  }

  setup(): void {
    const ranks = range(0,25)
    const shuffleable = ranks.filter(i => i !== 5 && i !== 1)
    const shuffled = shuffle(shuffleable)
    const startPlayer = this.players.get(this.input.startingPlayerId)
    if(startPlayer == null) {
      throw new Error(`Invalid startingPlayerId ${this.input.startingPlayerId}`)
    }
    const startMessage = `${startPlayer.name} started the game`
    const startEpisode = this.addEpisode(this.history, startMessage)
  }

  addEpisode(siblings: Episode[], message: string, playerId?: string): Episode {
    const episodeDef = {
      state: this,
      siblings,
      message,
      playerId
    }
    return new Episode(episodeDef)
  }
}