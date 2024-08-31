import Rand from 'rand-seed'
import * as External from './external'
import { Phase, Input, Color} from './external'
import { Player } from './player'
import { range, shuffle } from './math'
import { Episode } from './episode'
import { arrayToString, cardsToString, numberToString } from './translate'
import { Card } from './card'

export class State {
  startTime: number
  rand: Rand
  market: Card[] = []
  archive: Card[] = []
  center: Card[] = []
  players = new Map<string,Player>()
  history: Episode[] = []
  round = 1
  lastMessageRound = 0
  phase: Phase = 'play'
  extraMarket = false
  playTied = false
  input: Input
  startEpisode?: Episode

  constructor(input: External.Input) {
    this.input = input
    this.startTime = Date.now()
    input.players.forEach(inputPlayer => {
      const player = new Player(input, inputPlayer)
      this.players.set(player.id, player)
    })
    this.rand = new Rand(input.seed)
  }

  setup(): void {
    const cardsInGame = this.getCardsInGame()
    if(this.startEpisode == null) throw new Error(`startEpisode is null`)
    if(cardsInGame.length === 0) throw new Error(`cardsInGame.length === 0`)
    const marketCard = cardsInGame.shift()
    const marketRankMessage = `The lowest rank ${this.input.names.card}, ${marketCard?.rank}, ${this.input.names.added} to the ${this.input.names.market}.`
    this.startEpisode.addChild(marketRankMessage)
  }

  getCardsInGame(): Card[] {
    const startPlayer = this.players.get(this.input.startingPlayerId)
    if(startPlayer == null) {
      throw new Error(`Invalid startingPlayerId ${this.input.startingPlayerId}`)
    }
    const startMessage = `${startPlayer.name} started the game`
    this.startEpisode = this.addHistoryEpisode(startMessage)
    const ranks = range(0,25)
    const shuffleable = ranks.filter(i => i !== 5 && i !== 1)
    const shuffled = shuffle(shuffleable,this.rand)
    const joinedRanks = arrayToString(shuffled)
    const shuffleMessage = `Shuffled ${this.input.names.cards} 0, 2, 3, 4, and 6 through 25: ${joinedRanks}`
    this.startEpisode.addChild(shuffleMessage)
    const dealCount = 13 + 2 * this.input.playerCount
    const dealCountMessage = `This deal count is thirteen plus twice the number of players: ${dealCount}`
    this.startEpisode.addChild(dealCountMessage)
    const ranksInGame = shuffled.slice(0, dealCount)
    const ranksNotInGame = shuffled.slice(dealCount)
    const cardsInGame = ranksInGame.map(rank => new Card(rank, this))
    const sortedCardsInGame = [...cardsInGame].sort((a,b) => a.rank-b.rank)
    const sortedMessage = `Dealt and sorted ${dealCount} ${this.input.names.cards} in a row: ${cardsToString(sortedCardsInGame)}`
    this.startEpisode.addChild(sortedMessage)
    const notInGameMessage = `${this.input.names.cards} ${arrayToString(ranksNotInGame)} are not in the game.`
    this.startEpisode.addChild(notInGameMessage)
    return cardsInGame
  }

  getPortfolio(cardsInGame: Card[]): Color[] {
    if(this.startEpisode == null) throw new Error(`startEpisode is null`)
    const greenCards = cardsInGame.filter(card => card.color === 'green')
    const greenCardsMessage = `The remaining green ${this.input.names.cards} are: ${cardsToString(greenCards)}`
    this.startEpisode.addChild(greenCardsMessage)
    const archiveCard = greenCards.shift()
    if(archiveCard == null) throw new Error('Archive card is null')
    let archiveCardMessage = `The ${this.input.names.lowestRank} green ${this.input.names.card}, ${archiveCard.rank},`
    archiveCardMessage += ` is ${this.input.names.archived} to the ${this.input.names.archive}.`
    this.startEpisode.addChild(archiveCardMessage)
    const redCards = cardsInGame.filter(card => card.color === 'red')
    const redCardsMessage =  `The remaining red ${this.input.names.cards} are: ${cardsToString(redCards)}.`
    this.startEpisode.addChild(redCardsMessage)
    const yellowCards = cardsInGame.filter(card => card.color === 'yellow')
    const yellowCardsMessage =  `The remaining yellow ${this.input.names.cards} are: ${cardsToString(yellowCards)}.`
    this.startEpisode.addChild(yellowCardsMessage)
    const portfolioGreen = this.getPortfolioColorCards('green', greenCards)
    const portfolioRed = this.getPortfolioColorCards('red', greenCards)
    const portfolioYellow = this.getPortfolioColorCards('yellow', greenCards)
    
    return [] // In progress...
  }

  getPortfolioColorCards(color: Color, colorCards: Card[]): Card[] {
    if(this.startEpisode == null) throw new Error(`startEpisode is null`)
    const portfolioCounts = {
      2: { green: 2, red: 3, yellow: 2 },
      3: { green: 2, red: 3, yellow: 3 },
      4: { green: 3, red: 3, yellow: 3 }
    }
    const portfolioCount = portfolioCounts[this.input.playerCount]
    const portfolioColorCards = colorCards.slice(0, portfolioCount[color])
    if(portfolioColorCards.length === 0) {
      const portfolioColorMessage = `There are no ${color} ${this.input.names.cards} remaining.`
      this.startEpisode.addChild(portfolioColorMessage)
    } else if(portfolioColorCards.length === 1) {
      let portfolioColorMessage = `The only remaining ${color} ${this.input.names.card} is ${portfolioColorCards[0].rank}`
      this.startEpisode.addChild(portfolioColorMessage)
    } else {
      let portfolioColorMessage = `The ${numberToString(portfolioColorCards.length)} lowest ${color}` 
      portfolioColorMessage += `${this.input.names.cards} are: ${cardsToString(portfolioColorCards)}.`
      this.startEpisode.addChild(portfolioColorMessage)
    }
    return portfolioColorCards
  }

  addHistoryEpisode(message: string, playerId?: string): Episode {
    const episodeDef = {
      state: this,
      siblings: this.history,
      message,
      playerId
    }
    return new Episode(episodeDef)
  }
}