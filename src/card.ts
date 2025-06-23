import { CardGroup } from './cardGroup/cardGroup'
import { Color } from './external'
import { Player } from './player'
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

  constructor (rank: number, state: State) {
    this.state = state
    this.rank = rank
    this.id = String(this.state.rand.next())
    this.charge = this.state.input.cardDetails.charges[this.rank]
    this.color = this.state.input.cardDetails.colors[this.rank]
    this.firstPower = this.state.input.cardDetails.firstPowers[this.rank]
    this.secondPower = this.state.input.cardDetails.secondPowers[this.rank]
    this.bonusPower = this.state.input.cardDetails.bonusPowers[this.rank]
    this.addPowers()
    this.state.cards[this.id] = this
  }

  play (player: Player): void {
    if (this.powers == null) {
      throw new Error(`card.play: card ${this.id} with rank ${this.rank} has no powers.`)
    }
    this.powers.execute(this, player, player.state.history)
  }

  addPowers (): void {
    if (this.rank === 3) this.powers = new Thief()
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
