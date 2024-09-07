export interface Input {
  gameId: string
  seed: string
  startingPlayerId: string
  cardDetails: CardDetails
  playerCount: 2 | 3 | 4
  players: InputPlayer[]
  events: Event[]
  names: {
    card: string
    cards: string
    market: string
    added: string
    archive: string
    archived: string
    lowestRank: string
    reserve: string
    center: string
  }
}

export interface CardDetails {
  ids: number[]
  colors: string[]
  charges: number[]
  firstPowers: string[]
  secondPowers: string[]
  bonusPowers: string[]
}

export interface InputPlayer {
  id: string
  userId: string
  name: string
}

export type EventType =
  'play' |
  'bid' |
  'withdraw' |
  'archive' |
  'concede' |
  'pendingChoice' |
  'take'

export type Phase = 'play' | 'auction'
export interface Event {
  time: number
  type: EventType
  phase: Phase
  userId: string
}

export interface PlayEvent extends Event {
  type: 'play'
  phase: 'play'
  playCard: Card
  trashCard: Card
}

export interface PendingChoiceEvent extends Event {
  type: 'pendingChoice'
  phase: 'play'
  cardIds: string[]
  pendingChoiceId: string
}

export interface BidEvent extends Event {
  type: 'bid'
  phase: 'auction'
  bid: number
}

export interface WithdrawEvent extends Event {
  type: 'withdraw'
  phase: 'auction'
}

export interface ArchiveEvent extends Event {
  type: 'archive'
  phase: 'auction'
}

export interface ConcedeEvent extends Event {
  type: 'concede'
  phase: 'auction'
}

export interface TakeEvent extends Event {
  type: 'take'
  phase: 'auction'
  cardIds: string[]
}

export interface Episode {
  message: string
  children: Episode[]
  time: number
  id: string
  round: number
  firstInRound: boolean
  playerId: string | null
}

export type CardColor = 'green' | 'yellow' | 'red'

export interface Card {
  id: string
  rank: number
}

export interface TrashCard {
  card: Card | null
  round: number
}

export interface Player {
  id: string
  userId: string
  name: string
  gameId: string
  history: Episode[]
  playReady: boolean
  withdrawn: boolean
  auctionReady: boolean
  playCard: Card | null
  trashCard: Card | null
  bid: number
  hand: Card[]
  reserve: Card[]
  inPlay: Card[]
  trash: TrashCard[]
  majorMoney: number
  minorMoney: number
}

export interface Profile {
  id: string
  userId: string
  name: string
  gameId: string
  playReady: boolean
  withdrawn: boolean
  auctionReady: boolean
  playCard: Card | null
  bid: number
  handCount: number
  handPossible: Card[]
  reserve: Card[]
  inPlay: Card[]
  trash: TrashCard[]
  majorMoney: number
  minorMoney: number
}

export type PendingChoiceType = 'trash' | 'recover' | 'recovermutiple'

export interface PendingChoice {
  id: string
  playerId: string
  type: PendingChoiceType
  card: Card
  copyingCard: Card | null
}

export type Color = 'green' | 'red' | 'yellow'

export interface Game {
  startTime: number
  history: Episode[]
  profiles: Profile[]
  pendingChoices: PendingChoice[]
  market: Card[]
  archive: Card[]
  center: Card[]
  round: number
  phase: Phase
  extraMarket: boolean
  playTied: boolean
}

export interface Output {
  players: Player[]
  game: Game
}

export type Service = (input: Input) => Output
