// Input types

export interface Input {
  gameId: string
  seed: string
  startingPlayerId: string
  cardDetails: CardDetails
  playerCount: 2 | 3 | 4 | 5
  players: InputPlayer[]
  events: InputEvent[]
  names: {
    archive: string
    archivedTo: string
    areAddedToMarket: string
    card: string
    Card: string
    cards: string
    Cards: string
    center: string
    charge: string
    charges: string
    deck: string
    earn: string
    empress: string
    highestRank: string
    inPlay: string
    isAddedToMarket: string
    joan: string
    lowestRank: string
    major: string
    market: string
    minor: string
    played: string
    rank: string
    rankedLower: string
    rankedHigher: string
    timeDoesNotPass: string
    timeDoesPass: string
    trash: string
    trashed: string
  }
}

export type Color = 'Blue' | 'Red' | 'Yellow'

export interface CardDetails {
  ranks: number[]
  colors: Color[]
  charges: number[]
  firstPowers: string[]
  secondPowers: string[]
  bonusPowers: string[]
}

export interface InputPlayer {
  id: string
  name: string
}

export type EventType =
  'plan' |
  'bid' |
  'withdraw' |
  'archive' |
  'concede' |
  'chooseExile' |
  'chooseHand' |
  'take'

export interface Event {
  playerId: string
  type: EventType
}

export interface PlanEvent extends Event {
  type: 'plan'
  playCard: Card
  trashCard: Card
}

export interface ChooseExileEvent extends Event {
  type: 'chooseExile'
  cardIds: string[]
  pendingChoiceId: string
}

export interface ChooseHandEvent extends Event {
  type: 'chooseHand'
  cardId: string
  pendingChoiceId: string
}

export interface BidEvent extends Event {
  type: 'bid'
  bid: number
}

export interface WithdrawEvent extends Event {
  type: 'withdraw'
}

// Offer to put the cards up for auction into the dungeon
export interface ProposeArchiveEvent extends Event {
  type: 'archive'
}

export interface ConcedeEvent extends Event {
  type: 'concede'
}

export interface TakeEvent extends Event {
  type: 'take'
  cardIds: string[]
}

export type InputEvent =
  PlanEvent |
  ChooseExileEvent |
  ChooseHandEvent |
  BidEvent |
  WithdrawEvent |
  ProposeArchiveEvent |
  ConcedeEvent |
  TakeEvent

export interface Card {
  id: string
  rank: number
}

// Output types

export interface Episode {
  message: string
  children: Episode[]
  time: number
  id: string
  round: number
  firstInRound: boolean
  playerId?: string
  groupId?: string
}

export interface PrivateTrashCard {
  id: string
  rank: number
  round: number
}

export interface PublicTrashCard {
  round: number
}

export interface Player {
  id: string
  name: string
  gameId: string
  history: Episode[]
  playReady: boolean
  withdrawn: boolean
  auctionReady: boolean
  bid: number
  hand: Card[]
  deck: Card[]
  play: Card[]
  trash: PrivateTrashCard[]
  majorMoney: number
  minorMoney: number
}

export interface Profile {
  playerId: string
  name: string
  gameId: string
  playReady: boolean
  withdrawn: boolean
  auctionReady: boolean
  bid: number
  handCount: number
  handPossible: Card[]
  deck: Card[]
  play: Card[]
  trash: PublicTrashCard[]
  majorMoney: number
  minorMoney: number
}

export type PendingChoiceType = 'exile' | 'hand' | 'exiles'

export interface PendingChoice {
  id: string
  playerId: string
  type: PendingChoiceType
  card: Card
  copyingCard: Card | null
}

export type Phase = 'play' | 'auction' | 'end'
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

// Service type

export type Service = (input: Input) => Output
