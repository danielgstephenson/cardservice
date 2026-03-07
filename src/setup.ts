import { Card } from './card'
import { Deck } from './cardGroup/deck'
import { Hand } from './cardGroup/hand'
import { Color } from './external'
import { range, shuffle } from './math'
import { State } from './state'
import { arrayToString, cardsToString, numberToString } from './translate'

export function setup (state: State): void {
  const cardsInGame = getCardsInGame(state)
  if (cardsInGame.length === 0) throw new Error('cardsInGame.length === 0')
  const marketCard = cardsInGame[0]
  state.startingMarket = [marketCard]
  let marketRankMessage = `The ${state.input.names.lowestRank} ${state.input.names.card}, `
  marketRankMessage += `${marketCard?.rank}, ${state.input.names.isAddedToMarket}.`
  state.startingEpisode.addPublicChild(marketRankMessage)
  const portfolio = getPortfolio(state, cardsInGame.slice(1))
  state.startingHand = portfolio.slice(0, 5)
  const handString = cardsToString(state.startingHand)
  const handMessage = `The hand is ${handString}.`
  state.startingEpisode.addPublicChild(handMessage)
  state.startingDeck = portfolio.slice(5)
  const deckString = cardsToString(state.startingDeck)
  const deckMessage = `The ${state.input.names.deck} is ${deckString}.`
  state.startingEpisode.addPublicChild(deckMessage)
  if (state.startingArchive.length === 0) throw new Error('startingArchive is empty')
  const excludeFromCenter = [...portfolio, ...state.startingArchive, marketCard]
  state.startingCenter = cardsInGame.filter(card => !excludeFromCenter.includes(card))
  const centerString = cardsToString(state.startingCenter)
  const centerMessage = `The ${state.input.names.center} is ${centerString}.`
  state.startingEpisode.addPublicChild(centerMessage)
  state.input.players.forEach(inputPlayer => {
    const player = state.players[inputPlayer.id]
    player.hand = new Hand(player, state.startingHand)
    player.deck = new Deck(player, state.startingDeck)
  })
  state.history.addPublicChild('Round 1 begins.')
}

function getCardsInGame (state: State): Card[] {
  const startPlayer = state.players[state.input.startingPlayerId]
  if (startPlayer == null) {
    throw new Error(`Invalid startingPlayerId ${state.input.startingPlayerId}`)
  }
  const startMessage = `${startPlayer.name} started the game.`
  state.startingEpisode = state.history.addPublicChild(startMessage)
  const ranks = range(1, 25)
  const notShuffleable = [1, 5, 8]
  const shuffleable = ranks.filter(rank => !notShuffleable.includes(rank))
  const shuffled = shuffle(shuffleable, state.rand)
  const joinedRanks = arrayToString(shuffled)
  const shuffleMessage = `Shuffled ${state.input.names.cards} 2, 3, 4, 6, 7, and 9 through 25: ${joinedRanks}.`
  state.startingEpisode.addPublicChild(shuffleMessage)
  const dealCount = 13 + state.input.playerCount
  const dealCountMessage = `The deal count is fourteen plus the number of players, ${dealCount}.`
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
  const blueCards = cardsInGame.filter(card => card.color === 'Blue')
  const blueCardsMessage = `The remaining blue ${state.input.names.cards} are ${cardsToString(blueCards)}.`
  state.startingEpisode.addPublicChild(blueCardsMessage)
  const archiveCard = blueCards.shift()
  if (archiveCard == null) throw new Error('archiveCard is null')
  state.startingArchive = [archiveCard]
  let archiveCardMessage = `The lowest remaining blue ${state.input.names.card}, ${archiveCard.rank},`
  archiveCardMessage += ` is ${state.input.names.archivedTo} the ${state.input.names.archive}.`
  state.startingEpisode.addPublicChild(archiveCardMessage)
  const redCards = cardsInGame.filter(card => card.color === 'Red')
  const redCardsMessage = `The remaining red ${state.input.names.cards} are ${cardsToString(redCards)}.`
  state.startingEpisode.addPublicChild(redCardsMessage)
  const yellowCards = cardsInGame.filter(card => card.color === 'Yellow')
  const yellowCardsMessage = `The remaining yellow ${state.input.names.cards} are ${cardsToString(yellowCards)}.`
  state.startingEpisode.addPublicChild(yellowCardsMessage)
  const portfolioBlue = getPortfolioColorCards(state, 'Blue', blueCards)
  const portfolioRed = getPortfolioColorCards(state, 'Red', redCards)
  const portfolioYellow = getPortfolioColorCards(state, 'Yellow', yellowCards)
  const portfolio = [new Card(5, state), new Card(8, state), ...portfolioBlue, ...portfolioRed, ...portfolioYellow]
  const sortedPortfolio = Card.sortByRank(portfolio)
  const sortedPortfolioString = cardsToString(sortedPortfolio)
  const portfolioMessage = `The portfolio is ${sortedPortfolioString}.`
  state.startingEpisode.addPublicChild(portfolioMessage)
  return sortedPortfolio
}

function getPortfolioColorCards (state: State, color: Color, colorCards: Card[]): Card[] {
  if (state.startingEpisode == null) throw new Error('startEpisode is null')
  const portfolioCounts = {
    2: { Blue: 1, Red: 4, Yellow: 3 },
    3: { Blue: 1, Red: 4, Yellow: 3 },
    4: { Blue: 1, Red: 4, Yellow: 3 },
    5: { Blue: 1, Red: 4, Yellow: 3 }
  }
  const portfolioCount = portfolioCounts[state.input.playerCount]
  const portfolioColorCards = colorCards.slice(0, portfolioCount[color])
  if (portfolioColorCards.length === 0) {
    const portfolioColorMessage = `There are no ${color.toLowerCase()} ${state.input.names.cards} remaining.`
    state.startingEpisode.addPublicChild(portfolioColorMessage)
  } else if (portfolioCount[color] === 1) {
    let portfolioColorMessage = `The lowest remaining ${color.toLowerCase()} `
    portfolioColorMessage += `${state.input.names.card} is ${portfolioColorCards[0].rank}.`
    state.startingEpisode.addPublicChild(portfolioColorMessage)
  } else if (portfolioColorCards.length === 1) {
    const portfolioColorMessage = `The only remaining ${color.toLowerCase()} ${state.input.names.card} is ${portfolioColorCards[0].rank}`
    state.startingEpisode.addPublicChild(portfolioColorMessage)
  } else {
    let portfolioColorMessage = `The ${numberToString(portfolioColorCards.length)} lowest remaining ${color.toLowerCase()} `
    portfolioColorMessage += `${state.input.names.cards} are ${cardsToString(portfolioColorCards)}.`
    state.startingEpisode.addPublicChild(portfolioColorMessage)
  }
  return portfolioColorCards
}
