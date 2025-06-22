import { InputPlayer } from './external'
import { State } from './state'
import { CardGroup } from './cardGroup/cardGroup'
import { Trash } from './cardGroup/trash'
import { Episode } from './episode'

export class Player {
  id: string
  userId: string
  gameId: string
  state: State
  name: string
  hand: CardGroup
  deck: CardGroup
  playArea = new CardGroup()
  trash = new Trash()
  discard = new CardGroup()
  majorMoney: number
  minorMoney = 0
  playReady = false
  withdrawn = false
  auctionReady = false
  bid = 0

  constructor (state: State, inputPlayer: InputPlayer) {
    this.id = inputPlayer.id
    this.userId = inputPlayer.userId
    this.name = inputPlayer.name
    this.gameId = state.input.gameId
    this.state = state
    this.hand = new CardGroup(state.startingHand)
    this.hand.label = `hand of player ${this.id}`
    this.deck = new CardGroup(state.startingDeck)
    this.hand.label = `deck of player ${this.id}`
    this.majorMoney = 70 - 10 * state.input.playerCount
    state.players[this.id] = this
  }

  earn (amount: number, privateEpisode: Episode, publicEpisode: Episode): void {
    if (amount < 0) {
      throw new Error('player.earn: amount must non-negative')
    }
    const minorAmount = amount % 5
    const majorAmount = amount - minorAmount
    const oldMajorMoney = this.majorMoney
    const oldMinorMoney = this.minorMoney
    this.minorMoney += minorAmount
    this.majorMoney += majorAmount
    const names = this.state.input.names
    let privateMessage = ''
    let publicMessage = ''
    if (majorAmount > 0 && minorAmount > 0) {
      privateMessage += `You earned ${majorAmount} ${names.major} and ${minorAmount} ${names.minor}.`
      publicMessage += `${this.name} earned ${majorAmount} ${names.major} and ${minorAmount} ${names.minor}.`
    } else if (majorAmount > 0 && minorAmount === 0) {
      privateMessage += `You earned ${majorAmount} ${names.major}.`
      publicMessage += `${this.name} earned ${majorAmount} ${names.major}.`
    } else if (majorAmount === 0 && minorAmount > 0) {
      privateMessage += `You earned ${minorAmount} ${names.minor}.`
      publicMessage += `${this.name} earned ${minorAmount} ${names.minor}.`
    }
    privateEpisode.addPrivateChild(privateMessage, [this])
    publicEpisode.addPublicChild(publicMessage)
    if (majorAmount > 0) {
      const privateMessage = `You went from ${oldMajorMoney} to ${this.majorMoney}`
      const publicMessage = `${this.name} went from ${oldMajorMoney} to ${this.majorMoney}`
      privateEpisode.addPrivateChild(publicMessage, [this])
      publicEpisode.addPublicChild(privateMessage)
    }
    if (minorAmount > 0) {
      const privateMessage = `You went from ${oldMinorMoney} to ${this.minorMoney}`
      const publicMessage = `${this.name} went from ${oldMinorMoney} to ${this.minorMoney}`
      privateEpisode.addPrivateChild(publicMessage, [this])
      publicEpisode.addPublicChild(privateMessage)
    }
  }

  pay (amount: number, privateEpisode: Episode, publicEpisode: Episode): void {
    if (amount < 0) {
      throw new Error('player.pay: amount must non-negative')
    }
    const minorAmount = Math.min(this.minorMoney, amount)
    const majorAmount = Math.min(amount - minorAmount, this.majorMoney)
    const oldMajorMoney = this.majorMoney
    const oldMinorMoney = this.minorMoney
    this.minorMoney -= minorAmount
    this.majorMoney -= majorAmount
    const names = this.state.input.names
    let privateMessage = ''
    let publicMessage = ''
    if (majorAmount > 0 && minorAmount > 0) {
      privateMessage += `You paid ${majorAmount} ${names.major} and ${minorAmount} ${names.minor}.`
      publicMessage += `${this.name} paid ${majorAmount} ${names.major} and ${minorAmount} ${names.minor}.`
    } else if (majorAmount > 0 && minorAmount === 0) {
      privateMessage += `You paid ${majorAmount} ${names.major}.`
      publicMessage += `${this.name} paid ${majorAmount} ${names.major}.`
    } else if (majorAmount === 0 && minorAmount > 0) {
      privateMessage += `You paid ${minorAmount} ${names.minor}.`
      publicMessage += `${this.name} paid ${minorAmount} ${names.minor}.`
    }
    privateEpisode.addPrivateChild(privateMessage, [this])
    publicEpisode.addPublicChild(publicMessage)
    if (majorAmount > 0) {
      const privateMessage = `You went from ${oldMajorMoney} to ${this.majorMoney}`
      const publicMessage = `${this.name} went from ${oldMajorMoney} to ${this.majorMoney}`
      privateEpisode.addPrivateChild(publicMessage, [this])
      publicEpisode.addPublicChild(privateMessage)
    }
    if (minorAmount > 0) {
      const privateMessage = `You went from ${oldMinorMoney} to ${this.minorMoney}`
      const publicMessage = `${this.name} went from ${oldMinorMoney} to ${this.minorMoney}`
      privateEpisode.addPrivateChild(publicMessage, [this])
      publicEpisode.addPublicChild(privateMessage)
    }
  }
}
