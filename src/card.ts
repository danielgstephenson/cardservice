import { CardGroup } from './cardGroup/cardGroup'
import { Color } from '.'
import { Player } from './player'
import { Diplomat } from './powers/diplomat'
import { Powers } from './powers/powers'
import { Thief } from './powers/thief'
import { State } from './state'

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
    if (this.rank === 3) this.powers = new Thief()
    if (this.rank === 7) this.powers = new Diplomat()
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
