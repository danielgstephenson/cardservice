import { } from './external'
import { State } from './state'
import { Player } from './player'

export interface EpisodeDef {
  state: State
  siblings: Episode[]
  playerId?: string
}

export class Episode {
  children: Episode[] = []
  siblings: Episode[]
  state: State
  time: number
  id: string
  round: number
  firstInRound: boolean
  playerId?: string
  spectateMessage?: string
  messages: Record<string, string> = {}

  constructor (def: EpisodeDef) {
    this.id = String(def.state.rand.next())
    this.state = def.state
    this.time = Date.now()
    this.siblings = def.siblings
    this.siblings.push(this)
    this.round = this.state.round
    this.firstInRound = this.round !== this.state.lastMessageRound
    this.state.lastMessageRound = this.round
    this.playerId = def.playerId
  }

  addPublicMessage (text: string): void {
    this.spectateMessage = text
    const players = Object.values(this.state.players)
    players.forEach(player => {
      this.messages[player.id] = text
    })
  }

  addPrivateMessage (player: Player, text: string): void {
    this.messages[player.id] = text
  }

  addOthersMessage (player: Player, text: string): void {
    this.spectateMessage = text
    const players = Object.values(this.state.players)
    const otherPlayers = players.filter(p => p.id !== player.id)
    otherPlayers.forEach(otherPlayer => {
      this.messages[otherPlayer.id] = text
    })
  }

  addChild (playerId?: string): Episode {
    const episodeDef = {
      state: this.state,
      siblings: this.children,
      playerId
    }
    return new Episode(episodeDef)
  }

  addPublicChild (message: string, playerId?: string): Episode {
    const child = this.addChild(playerId)
    child.addPublicMessage(message)
    return child
  }

  addPrivateChild (player: Player, message: string, playerId?: string): Episode {
    const child = this.addChild(playerId)
    child.addPrivateMessage(player, message)
    return child
  }

  addYouChild (player: Player, privateMessage: string, publicMessage: string, playerId?: string): Episode {
    const child = this.addChild(playerId)
    child.addPrivateMessage(player, privateMessage)
    child.addOthersMessage(player, publicMessage)
    return child
  }
}
