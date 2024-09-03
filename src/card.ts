import { State } from './state'

export class Card {
  state: State
  id: string
  rank: number
  charge: number
  color: string
  firstPower: string
  secondPower: string
  bonusPower: string

  constructor (rank: number, state: State) {
    this.state = state
    this.rank = rank
    this.id = String(Math.random())
    this.charge = this.state.input.cardDetails.charges[this.rank]
    this.color = this.state.input.cardDetails.colors[this.rank]
    this.firstPower = this.state.input.cardDetails.firstPowers[this.rank]
    this.secondPower = this.state.input.cardDetails.secondPowers[this.rank]
    this.bonusPower = this.state.input.cardDetails.bonusPowers[this.rank]
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
