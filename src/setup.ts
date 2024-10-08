import { Card } from './card'
import { Color } from './external'
import { range, shuffle } from './math'
import { Player } from './player'
import { State } from './state'
import { arrayToString, cardsToString, numberToString } from './translate'

export function setup (state: State): void {
  const cardsInGame = getCardsInGame(state)
  if (state.startingEpisode == null) throw new Error('startEpisode is null')
  if (cardsInGame.length === 0) throw new Error('cardsInGame.length === 0')
  const marketCard = cardsInGame[0]
  state.startingMarket = [marketCard]
  let marketRankMessage = `The ${state.input.names.lowestRank} ${state.input.names.card}, `
  marketRankMessage += `${marketCard?.rank}, ${state.input.names.isAddedToMarket}.`
  state.startingEpisode.addPublicChild(marketRankMessage)
  const portfolio = getPortfolio(state, cardsInGame.slice(1))
  state.startingHand = portfolio.slice(0, 5)
  const handString = cardsToString(state.startingHand)
  const handMessage = `The hand is: ${handString}.`
  state.startingEpisode.addPublicChild(handMessage)
  state.startingReserve = portfolio.slice(5)
  const reserveString = cardsToString(state.startingReserve)
  const reserveMessage = `The ${state.input.names.reserve} is: ${reserveString}.`
  state.startingEpisode.addPublicChild(reserveMessage)
  if (state.startingArchive.length === 0) throw new Error('startingArchive is empty')
  const excludeFromCenter = [...portfolio, ...state.startingArchive, marketCard]
  state.startingCenter = cardsInGame.filter(card => !excludeFromCenter.includes(card))
  const centerString = cardsToString(state.startingCenter)
  const centerMessage = `The ${state.input.names.center} is: ${centerString}.`
  state.startingEpisode.addPublicChild(centerMessage)
  state.input.players.forEach(inputPlayer => {
    state.players.set(inputPlayer.id, new Player(state, inputPlayer))
  })
  state.history.addPublicChild('Round 1 begins.')
}

function getCardsInGame (state: State): Card[] {
  const startPlayer = state.players.get(state.input.startingPlayerId)
  if (startPlayer == null) {
    throw new Error(`Invalid startingPlayerId ${state.input.startingPlayerId}`)
  }
  const startMessage = `${startPlayer.name} started the game.`
  state.startingEpisode = state.history.addPublicChild(startMessage)
  const ranks = range(0, 25)
  const shuffleable = ranks.filter(i => i !== 5 && i !== 1)
  const shuffled = shuffle(shuffleable, state.rand)
  const joinedRanks = arrayToString(shuffled)
  const shuffleMessage = `Shuffled ${state.input.names.cards} 0, 2, 3, 4, and 6 through 25: ${joinedRanks}.`
  state.startingEpisode.addPublicChild(shuffleMessage)
  const dealCount = 12 + 2 * state.input.playerCount
  const dealCountMessage = `This deal count is thirteen plus twice the number of players: ${dealCount}.`
  state.startingEpisode.addPublicChild(dealCountMessage)
  const ranksInGame = shuffled.slice(0, dealCount)
  const ranksNotInGame = shuffled.slice(dealCount)
  const cardsInGame = ranksInGame.map(rank => new Card(rank, state))
  const sortedCardsInGame = [...cardsInGame].sort((a, b) => a.rank - b.rank)
  const sortedMessage = `Dealt and sorted ${dealCount} ${state.input.names.cards} in a row: ${cardsToString(sortedCardsInGame)}.`
  state.startingEpisode.addPublicChild(sortedMessage)
  const notInGameMessage = `${state.input.names.Cards} ${arrayToString(ranksNotInGame)} are not in the game.`
  state.startingEpisode.addPublicChild(notInGameMessage)
  return sortedCardsInGame
}

function getPortfolio (state: State, cardsInGame: Card[]): Card[] {
  if (state.startingEpisode == null) throw new Error('startEpisode is null')
  const greenCards = cardsInGame.filter(card => card.color === 'Green')
  const greenCardsMessage = `The remaining green ${state.input.names.cards} are: ${cardsToString(greenCards)}.`
  state.startingEpisode.addPublicChild(greenCardsMessage)
  const archiveCard = greenCards.shift()
  if (archiveCard == null) throw new Error('archiveCard is null')
  state.startingArchive = [archiveCard]
  let archiveCardMessage = `The ${state.input.names.lowestRank} green ${state.input.names.card}, ${archiveCard.rank},`
  archiveCardMessage += ` is ${state.input.names.archivedTo} the ${state.input.names.archive}.`
  state.startingEpisode.addPublicChild(archiveCardMessage)
  const redCards = cardsInGame.filter(card => card.color === 'Red')
  const redCardsMessage = `The remaining red ${state.input.names.cards} are: ${cardsToString(redCards)}.`
  state.startingEpisode.addPublicChild(redCardsMessage)
  const yellowCards = cardsInGame.filter(card => card.color === 'Yellow')
  const yellowCardsMessage = `The remaining yellow ${state.input.names.cards} are: ${cardsToString(yellowCards)}.`
  state.startingEpisode.addPublicChild(yellowCardsMessage)
  const portfolioGreen = getPortfolioColorCards(state, 'Green', greenCards)
  const portfolioRed = getPortfolioColorCards(state, 'Red', redCards)
  const portfolioYellow = getPortfolioColorCards(state, 'Yellow', yellowCards)
  const portfolio = [new Card(5, state), ...portfolioGreen, ...portfolioRed, ...portfolioYellow]
  const sortedPortfolio = Card.sortByRank(portfolio)
  const sortedPortfolioString = cardsToString(sortedPortfolio)
  const portfolioMessage = `The portfolio is: ${sortedPortfolioString}.`
  state.startingEpisode.addPublicChild(portfolioMessage)
  return sortedPortfolio
}

function getPortfolioColorCards (state: State, color: Color, colorCards: Card[]): Card[] {
  if (state.startingEpisode == null) throw new Error('startEpisode is null')
  const portfolioCounts = {
    2: { Green: 2, Red: 3, Yellow: 2 },
    3: { Green: 2, Red: 3, Yellow: 3 },
    4: { Green: 3, Red: 3, Yellow: 3 },
    5: { Green: 3, Red: 4, Yellow: 3 }
  }
  const portfolioCount = portfolioCounts[state.input.playerCount]
  const portfolioColorCards = colorCards.slice(0, portfolioCount[color])
  if (portfolioColorCards.length === 0) {
    const portfolioColorMessage = `There are no ${color.toLowerCase()} ${state.input.names.cards} remaining.`
    state.startingEpisode.addPublicChild(portfolioColorMessage)
  } else if (portfolioColorCards.length === 1) {
    const portfolioColorMessage = `The only remaining ${color.toLowerCase()} ${state.input.names.card} is ${portfolioColorCards[0].rank}`
    state.startingEpisode.addPublicChild(portfolioColorMessage)
  } else {
    let portfolioColorMessage = `The ${numberToString(portfolioColorCards.length)} lowest ${color.toLowerCase()} `
    portfolioColorMessage += `${state.input.names.cards} are: ${cardsToString(portfolioColorCards)}.`
    state.startingEpisode.addPublicChild(portfolioColorMessage)
  }
  return portfolioColorCards
}
