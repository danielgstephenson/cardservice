import { InputPlayer } from './external'
import { State } from './state'
import { Trash } from './cardGroup/trash'
import { Episode } from './episode'
import { Card } from './card'
import { cardsToString } from './translate'
import { range } from './math'
import { Hand } from './cardGroup/hand'
import { PlayerCardGroup } from './cardGroup/playerCardGroup'
import { Deck } from './cardGroup/deck'

export class Player {
  id: string
  gameId: string
  state: State
  name: string
  hand: Hand
  deck: Deck
  playArea = new PlayerCardGroup(this)
  trashArea = new Trash(this)
  majorMoney = 50
  minorMoney = 0
  playReady = false
  withdrawn = false
  auctionReady = false
  bid = 0

  constructor (state: State, inputPlayer: InputPlayer) {
    this.id = inputPlayer.id
    this.name = inputPlayer.name
    this.gameId = state.input.gameId
    this.state = state
    this.hand = new Hand(this)
    this.deck = new Deck(this)
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

  play (card: Card, groupId: string): void {
    if (card.powers == null) {
      throw new Error(`Player.play: card ${card.id} with rank ${card.rank} has no powers.`)
    }
    const privateMessage = `You play ${card.rank}.`
    const publicMessage = `${this.name} plays ${card.rank}.`
    const playEpisode = this.state.history.addYouChild(this, privateMessage, publicMessage, this.id)
    playEpisode.groupId = groupId
    this.hand.impossible(card)
    card.powers.execute(card, this, playEpisode)
  }

  draw (drawCount: number, parentEpisode: Episode, drawPawns?: boolean): void {
    const names = this.state.input.names
    const deckDrawCount = Math.min(drawCount, this.deck.array.length)
    const deckDrawCards: Card[] = []
    const oldDeckString = cardsToString(this.deck.array)
    const deckEmpty = this.deck.array.length === 0
    range(deckDrawCount).forEach(_ => {
      const card = this.deck.array[0]
      this.hand.add(card)
      deckDrawCards.push(card)
    })
    const newDeckString = cardsToString(this.deck.array)
    if (drawCount > this.deck.array.length && drawPawns === true) {
      const pawnCount = drawCount - this.deck.array.length
      const pawns = range(pawnCount).map(_ => new Card(1, this.state))
      pawns.forEach(pawn => this.hand.add(pawn))
    }
    if (deckEmpty && drawPawns === true) {
      const privateMessage = `Your deck is empty, so you take ${drawCount} pawns from the bank.`
      const publicMessage = `${this.name}'s deck is empty, so they take ${drawCount} pawns from the bank.`
      parentEpisode.addYouChild(this, privateMessage, publicMessage)
    } else if (deckEmpty && drawPawns !== true) {
      const privateMessage = 'Your deck is empty.'
      const publicMessage = `${this.name}'s deck is empty.`
      parentEpisode.addYouChild(this, privateMessage, publicMessage)
    } else if (drawPawns === true && drawCount > deckDrawCount) {
      const deckDrawString = cardsToString(deckDrawCards)
      const pawnCount = drawCount - deckDrawCount
      let privateMessage = `You draw ${deckDrawString} from your ${names.deck} `
      privateMessage += `and take ${pawnCount} pawns from the bank.`
      let publicMessage = `${this.name} draws ${deckDrawString} ${names.cards} from their ${names.deck} `
      publicMessage += `and takes ${pawnCount} pawns from the bank.`
      parentEpisode.addYouChild(this, privateMessage, publicMessage)
      // Your deck was
    } else if (drawCount > deckDrawCount) {
      const deckSize = this.deck.array.length
      const deckString = cardsToString(this.deck.array)
      const them = deckSize > 1 ? 'them all' : 'it'
      let privateMessage = `Your ${names.deck} only has ${deckSize}, ${deckString}, `
      privateMessage += `so you draw ${them}.`
      let publicMessage = `${this.name}'s ${names.deck} only has ${deckSize}, ${deckString}, `
      publicMessage += `so they draw ${them}.`
      parentEpisode.addYouChild(this, privateMessage, publicMessage)
      // Your deck was
    } else if (this.deck.array.length >= drawCount) {
      const deckDrawString = cardsToString(deckDrawCards)
      const privateMessage = `You draw ${drawCount} from your ${names.deck}, ${deckDrawString}.`
      const publicMessage = `${this.name} draws ${drawCount} from their ${names.deck}, ${deckDrawString}.`
      parentEpisode.addYouChild(this, privateMessage, publicMessage)
      // Your deck was
      const privateWasMessage = `Your ${names.deck} was ${oldDeckString}.`
      const publicWasMessage = `${this.name}'s ${names.deck} was ${oldDeckString}.`
      parentEpisode.addYouChild(this, privateWasMessage, publicWasMessage)

      const privateBecomesMessage = `Your ${names.deck} becomes ${newDeckString}.`
      const publicBecomesMessage = `${this.name}'s ${names.deck} becomes ${newDeckString}.`
      parentEpisode.addYouChild(this, privateBecomesMessage, publicBecomesMessage)
    }
  }

  drawUpToThree (planEpisode: Episode): void {
    const drawCount = Math.max(0, 3 - this.hand.array.length)
    if (drawCount === 0) return
    const privateMessage = `You draw ${drawCount} to get back up to 3.`
    const publicMessage = `${this.name} draws ${drawCount} to get back up to 3.`
    const drawEpisode = planEpisode.addYouChild(this, privateMessage, publicMessage)
    this.draw(drawCount, drawEpisode, true)
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
      const privateMessage = `You went from ${oldMinorMoney} to ${this.minorMoney} ${names.minor}.`
      const publicMessage = `${this.name} went from ${oldMinorMoney} to ${this.minorMoney} ${names.minor}.`
      earnEpisode.addYouChild(this, privateMessage, publicMessage)
    }
  }

  getScore (): number {
    let score = 0
    this.hand.array.forEach(card => {
      score += card.rank
    })
    score += this.majorMoney + this.minorMoney
    return score
  }

  pay (amount: number, parentEpisode: Episode, showTotal = false): void {
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
    if (showTotal) {
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
      parentEpisode.addYouChild(this, privateMessage, publicMessage)
    }
    if (majorAmount > 0) {
      const privateMessage = `You went from ${oldMajorMoney} ${names.major} to ${this.majorMoney} ${names.major}`
      const publicMessage = `${this.name} went from ${oldMajorMoney} ${names.major} to ${this.majorMoney} ${names.major}`
      parentEpisode.addYouChild(this, privateMessage, publicMessage)
    }
    if (minorAmount > 0) {
      const privateMessage = `You went from ${oldMinorMoney} ${names.minor} to ${this.minorMoney} ${names.minor}`
      const publicMessage = `${this.name} went from ${oldMinorMoney} ${names.minor} to ${this.minorMoney} ${names.minor}`
      parentEpisode.addYouChild(this, privateMessage, publicMessage)
    }
  }
}
