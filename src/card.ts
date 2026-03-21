import { CardGroup } from './cardGroup/cardGroup'
import { Color } from './external'
import { Player } from './player'
import { Powers } from './powers/powers'
import { Pirate } from './powers/pirate'
import { State } from './state'
import { Princess } from './powers/princess'
import { Duelist } from './powers/duelist'

export class Card {
  state: State
  id: string
  rank: number
  charge: number
  color: Color
  firstPower: string
  secondPower: string
  bonusPower: string
  trashRound?: number
  group?: CardGroup
  powers?: Powers
  player?: Player

  constructor (rank: number, state: State) {
    this.state = state
    this.rank = rank
    this.id = String(this.state.rand.next())
    this.charge = this.state.input.cardDetails.charges[this.rank - 1]
    this.color = this.state.input.cardDetails.colors[this.rank - 1]
    this.firstPower = this.state.input.cardDetails.firstPowers[this.rank - 1]
    this.secondPower = this.state.input.cardDetails.secondPowers[this.rank - 1]
    this.bonusPower = this.state.input.cardDetails.bonusPowers[this.rank - 1]
    this.addPowers()
    this.state.cards[this.id] = this
  }

  addPowers (): void {
    if (this.rank === 4) this.powers = new Pirate()
    if (this.rank === 7) this.powers = new Princess()
    if (this.rank === 9) this.powers = new Duelist()
  }

  static sortByRank (cards: Card[]): Card[] {
    const sorted = [...cards]
    sorted.sort((a, b) => a.rank - b.rank)
    return sorted
  }

  static sortByRankDescend (cards: Card[]): Card[] {
    const sorted = [...cards]
    sorted.sort((a, b) => b.rank - a.rank)
    return sorted
  }

  static cloneCards (cards: Card[]): Card[] {
    return cards.map(card => new Card(card.rank, card.state))
  }
}
