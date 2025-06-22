import { } from './external'
import { State } from './state'
import { Player } from './player'

export interface EpisodeDef {
  state: State
  siblings: Episode[]
  message: string
  playerId?: string
  spectate?: boolean
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
  spectate: boolean
  viewers: string[]

  constructor (def: EpisodeDef) {
    this.id = String(def.state.rand.next())
    this.state = def.state
    this.spectate = def.spectate ?? false
    this.viewers = []
    if (def.viewers != null) {
      const ids = def.viewers.map(viewer => viewer.id)
      this.viewers.push(...ids)
    }
    this.time = Date.now()
    this.siblings = def.siblings
    this.siblings.push(this)
    this.message = def.message
    this.round = this.state.round
    this.firstInRound = this.round !== this.state.lastMessageRound
    this.state.lastMessageRound = this.round
    this.playerId = def.playerId
  }

  addSpectatorChild (message: string, playerId?: string): Episode {
    const episodeDef = {
      state: this.state,
      siblings: this.children,
      private: false,
      message,
      playerId
    }
    return new Episode(episodeDef)
  }

  addPublicChild (message: string, playerId?: string): Episode {
    const viewers = Object.values(this.state.players)
    return this.addChild(message, viewers, true, playerId)
  }

  addOthersChild (message: string, excluded: Player[], playerId?: string): Episode {
    const playerArray = Object.values(this.state.players)
    const viewers = playerArray.filter(player => !excluded.includes(player))
    return this.addChild(message, viewers, true, playerId)
  }

  addPrivateChild (message: string, viewers: Player[], playerId?: string): Episode {
    return this.addChild(message, viewers, false, playerId)
  }

  addChild (message: string, viewers: Player[], spectate?: boolean, playerId?: string): Episode {
    const episodeDef = {
      state: this.state,
      siblings: this.children,
      spectate,
      viewers,
      message,
      playerId
    }
    return new Episode(episodeDef)
  }
}
