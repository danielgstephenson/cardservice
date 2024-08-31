
import * as External from './external'
import { State } from './state'

export class Card {
  state: State
  id:  string
  rank: number
  charge: number
  color: string
  firstPower: string
  secondPower: string
  bonusPower: string 

  constructor(rank: number, state: State) {
    this.state = state
    this.rank = rank
    this.id = String(Math.random())
    this.charge = this.state.input.cardDetails.charges[this.rank]
    this.color = this.state.input.cardDetails.colors[this.rank]
    this.firstPower = this.state.input.cardDetails.firstPowers[this.rank]
    this.secondPower = this.state.input.cardDetails.secondPowers[this.rank]
    this.bonusPower = this.state.input.cardDetails.bonusPowers[this.rank]

  }
}