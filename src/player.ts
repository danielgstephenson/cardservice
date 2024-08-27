import Rand from 'rand-seed'
import * as External from './external'
import { Card, TrashCard, Input, InputPlayer, Episode } from './external'

export class Player {
  id: string
  userId: string
  gameId: string
  name: string
  hand: Card[] = []
  reserve: Card[] = []
  inPlay: Card[] = []
  trash: TrashCard[] = []
  history: Episode[] = []
  majorMoney = 0
  minorMoney = 0
  playReady = false
  withdrawn = false
  auctionReady = false
  playCard: Card | null = null
  trashCard: Card | null = null
  bid = 0

  constructor(input: Input, inputPlayer: InputPlayer) {
    this.id = inputPlayer.id
    this.userId = inputPlayer.userId
    this.name = inputPlayer.name
    this.gameId = input.gameId
  }
}