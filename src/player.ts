import { InputPlayer } from './external'
import { State } from './state'
import { CardGroup } from './cardGroup/cardGroup'
import { Trash } from './cardGroup/trash'
import { Episode } from './episode'
import { Card } from './card'
import { cardsToString } from './translate'

export class Player {
  id: string
  userId: string
  gameId: string
  state: State
  name: string
  hand: CardGroup
  deck: CardGroup
  playArea = new CardGroup()
  trashArea = new Trash()
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

  trash (card: Card, silent?: boolean): void {
    this.trashArea.add(card)
    if (silent === true) return
    this.addTrashEpisode(card)
  }

  addTrashEpisode (card: Card): void {
    const names = this.state.input.names
    const trashRank = this.trashArea.array[this.trashArea.array.length - 1].rank
    const trashMessage = `You ${names.trash} ${trashRank}.`
    const trashEpisode = this.state.history.addPrivateChild(this, trashMessage)
    const oldTrash = this.trashArea.array.slice(1)
    const oldTrashMessage = `Your trash was ${cardsToString(oldTrash)}.`
    const newTrashMessage = `Your trash becomes ${cardsToString(this.trashArea.array)}.`
    trashEpisode.addPrivateChild(this, oldTrashMessage)
    trashEpisode.addPrivateChild(this, newTrashMessage)
  }

  play (card: Card): void {
    if (card.powers == null) {
      throw new Error(`Player.play: card ${card.id} with rank ${card.rank} has no powers.`)
    }
    const privateMessage = `You play ${card.rank}.`
    const publicMessage = `${this.name} plays ${card.rank}.`
    const playEpisode = this.state.history.addYouChild(this, privateMessage, publicMessage, this.id)
    card.powers.execute(card, this, playEpisode)
  }

  copy (card: Card): void {}

  earn (amount: number, parentEpisode: Episode): void {
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
      privateMessage += `You earn ${majorAmount} ${names.major} and ${minorAmount} ${names.minor}.`
      publicMessage += `${this.name} earns ${majorAmount} ${names.major} and ${minorAmount} ${names.minor}.`
    } else if (majorAmount > 0 && minorAmount === 0) {
      privateMessage += `You earn ${majorAmount} ${names.major}.`
      publicMessage += `${this.name} earns ${majorAmount} ${names.major}.`
    } else if (majorAmount === 0 && minorAmount > 0) {
      privateMessage += `You earn ${minorAmount} ${names.minor}.`
      publicMessage += `${this.name} earns ${minorAmount} ${names.minor}.`
    }
    const earnEpisode = parentEpisode.addYouChild(this, privateMessage, publicMessage)
    if (majorAmount > 0) {
      const privateMessage = `You went from ${oldMajorMoney} to ${this.majorMoney} ${names.major}.`
      const publicMessage = `${this.name} went from ${oldMajorMoney} to ${this.majorMoney} ${names.major}.`
      earnEpisode.addYouChild(this, privateMessage, publicMessage)
    }
    if (minorAmount > 0) {
      const privateMessage = `You went from ${oldMinorMoney} to ${this.minorMoney} ${names.major}.`
      const publicMessage = `${this.name} went from ${oldMinorMoney} to ${this.minorMoney} ${names.major}.`
      earnEpisode.addYouChild(this, privateMessage, publicMessage)
    }
  }

  pay (amount: number, parentEpisode: Episode): void {
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
    const payEpisode = parentEpisode.addYouChild(this, privateMessage, publicMessage)
    if (majorAmount > 0) {
      const privateMessage = `You went from ${oldMajorMoney} to ${this.majorMoney}`
      const publicMessage = `${this.name} went from ${oldMajorMoney} to ${this.majorMoney}`
      payEpisode.addYouChild(this, privateMessage, publicMessage)
    }
    if (minorAmount > 0) {
      const privateMessage = `You went from ${oldMinorMoney} to ${this.minorMoney}`
      const publicMessage = `${this.name} went from ${oldMinorMoney} to ${this.minorMoney}`
      payEpisode.addYouChild(this, privateMessage, publicMessage)
    }
  }
}
