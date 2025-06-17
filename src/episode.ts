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
  viewers: string[]

  constructor (def: EpisodeDef) {
    this.id = String(def.state.rand.next())
    this.state = def.state
    this.private = def.private ?? false
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

  addBroadcastChild (message: string, playerId?: string): Episode {
    const viewers = Object.values(this.state.players)
    if (message === 'n1 started the game.') {
      const names = viewers.map(viewer => viewer.name)
      console.log('message', message)
      console.log('viewers', names)
    }
    const episodeDef = {
      state: this.state,
      siblings: this.children,
      private: false,
      viewers,
      message,
      playerId
    }
    return new Episode(episodeDef)
  }

  addOthersChild (message: string, excluded: Player[], playerId?: string): Episode {
    const playerArray = Object.values(this.state.players)
    const viewers = playerArray.filter(player => !excluded.includes(player))
    return this.addPrivateChild(message, viewers, playerId)
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
