import { } from './external'
import { State } from './state'
import { Player } from './player'

export interface EpisodeDef {
  state: State
  siblings: Episode[]
  message: string
  playerId?: string
  private?: boolean
  viewers?: Player[]
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
  playerId?: string
  private: boolean
  viewers: Player[]

  constructor (def: EpisodeDef) {
    this.id = String(def.state.rand.next())
    this.state = def.state
    this.private = def.private ?? false
    this.viewers = def.viewers ?? []
    this.time = Date.now()
    this.siblings = def.siblings
    this.siblings.push(this)
    this.message = def.message
    this.round = this.state.round
    this.firstInRound = this.round !== this.state.lastMessageRound
    this.state.lastMessageRound = this.round
    this.playerId = def.playerId
  }

  addPublicChild (message: string, playerId?: string): Episode {
    const episodeDef = {
      state: this.state,
      siblings: this.children,
      private: false,
      message,
      playerId
    }
    return new Episode(episodeDef)
  }

  addPrivateChild (message: string, viewers: Player[], playerId?: string): Episode {
    const episodeDef = {
      state: this.state,
      siblings: this.children,
      private: true,
      viewers,
      message,
      playerId
    }
    return new Episode(episodeDef)
  }
}
