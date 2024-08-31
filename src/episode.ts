import * as External from './external'
import { } from './external'
import { State } from './state'

export interface EpisodeDef {
  state: State
  siblings: Episode[]
  message: string
  playerId?: string
}

export class Episode {
  children: Episode[] = []
  message: string
  siblings: Episode[]
  state: State
  time: number
  id: string
  round: number
  firstInRound: boolean
  playerId: string | undefined

  constructor(def: EpisodeDef) {
    this.id = String(def.state.rand.next())
    this.state = def.state
    this.time = Date.now()
    this.siblings = def.siblings
    this.siblings.push(this)
    this.message = def.message
    this.round = this.state.round
    this.firstInRound = this.round !== this.state.lastMessageRound
    this.state.lastMessageRound = this.round
    this.playerId = def.playerId
  }

  addChild(message: string, playerId?: string) {
    const episodeDef = {
      state: this.state,
      siblings: this.children,
      message,
      playerId
    }
    return new Episode(episodeDef)
  }
}