import { Card } from './card'
import { Deck } from './cardGroup/deck'
import { Hand } from './cardGroup/hand'
import { Color } from './external'
import { range, shuffle } from './math'
import { State } from './state'
import { arrayToString, cardsToString, numberToString } from './translate'

export function setup (state: State): void {
  const names = state.input.names
  const cardsInGame = getCardsInGame(state)
  if (cardsInGame.length === 0) throw new Error('cardsInGame.length === 0')
  state.startingMarket = []
  const portfolio = getPortfolio(state, cardsInGame)
  state.startingHand = portfolio.slice(0, 5)
  const handString = cardsToString(state.startingHand)
  const handMessage = `The hand is ${handString}.`
  state.startingEpisode.addPublicChild(handMessage)
  state.startingDeck = portfolio.slice(5)
  const deckString = cardsToString(state.startingDeck)
  const deckMessage = `The ${names.deck} is ${deckString}.`
  state.startingEpisode.addPublicChild(deckMessage)
  if (state.startingArchive.length === 0) throw new Error('startingArchive is empty')
  const excludeFromCenter = [...portfolio, ...state.startingArchive]
  state.startingCenter = cardsInGame.filter(card => !excludeFromCenter.includes(card))
  const centerString = cardsToString(state.startingCenter)
  const centerMessage = `The ${names.center} has ${state.startingCenter.length} cards: ${centerString}.`
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
  const notShuffleable = [1]
  const shuffleable = ranks.filter(rank => !notShuffleable.includes(rank))
  const shuffled = shuffle(shuffleable, state.rand)
  const joinedRanks = arrayToString(shuffled)
  const shuffleMessage = `Shuffled ${state.input.names.cards} 2 through 25: ${joinedRanks}.`
  state.startingEpisode.addPublicChild(shuffleMessage)
  const dealCount = 12 + state.input.playerCount
  const dealCountMessage = `The deal count is twelve plus the number of players, ${dealCount}.`
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
  const blueAndYellowCards = cardsInGame.filter(card => card.color === 'Blue' || card.color === 'Yellow')
  const blueYellowCardsMessage = `The remaining blue and yellow ${state.input.names.cards} are ${cardsToString(blueAndYellowCards)}.`
  state.startingEpisode.addPublicChild(blueYellowCardsMessage)
  const archiveCard = blueAndYellowCards.shift()
  if (archiveCard == null) throw new Error('archiveCard is null')
  state.startingArchive = [archiveCard]
  let archiveCardMessage = `The lowest remaining blue or yellow ${state.input.names.card}, ${archiveCard.rank},`
  archiveCardMessage += ` is ${state.input.names.archivedTo} the ${state.input.names.archive}.`
  state.startingEpisode.addPublicChild(archiveCardMessage)
  let optionCards = cardsInGame.filter(card => card.rank !== archiveCard.rank)
  const redCards = optionCards.filter(card => card.color === 'Red')
  const redCardsMessage = `The remaining red ${state.input.names.cards} are ${cardsToString(redCards)}.`
  state.startingEpisode.addPublicChild(redCardsMessage)
  const yellowCards = optionCards.filter(card => card.color === 'Yellow')
  const yellowCardsMessage = `The remaining yellow ${state.input.names.cards} are ${cardsToString(yellowCards)}.`
  state.startingEpisode.addPublicChild(yellowCardsMessage)
  const blueCards = cardsInGame.filter(card => card.color === 'Blue')
  const blueCardsMessage = `The remaining blue ${state.input.names.cards} are ${cardsToString(blueCards)}.`
  state.startingEpisode.addPublicChild(blueCardsMessage)
  const portfolioBlue = getPortfolioColorCards(state, 'Blue', optionCards)
  optionCards = optionCards.filter(card => !portfolioBlue.includes(card))
  const portfolioRed = getPortfolioColorCards(state, 'Red', optionCards)
  optionCards = optionCards.filter(card => !portfolioRed.includes(card))
  const portfolioYellow = getPortfolioColorCards(state, 'Yellow', optionCards)
  const portfolio = [...portfolioBlue, ...portfolioRed, ...portfolioYellow]
  const sortedPortfolio = Card.sortByRank(portfolio)
  const sortedPortfolioString = cardsToString(sortedPortfolio)
  const portfolioMessage = `The portfolio is ${sortedPortfolioString}.`
  state.startingEpisode.addPublicChild(portfolioMessage)
  return sortedPortfolio
}

function getPortfolioColorCards (state: State, color: Color, optionCards: Card[]): Card[] {
  if (state.startingEpisode == null) throw new Error('startEpisode is null')
  const portfolioCounts = {
    2: { Blue: 2, Red: 3, Yellow: 3 },
    3: { Blue: 2, Red: 3, Yellow: 3 },
    4: { Blue: 2, Red: 3, Yellow: 3 },
    5: { Blue: 2, Red: 3, Yellow: 3 }
  }
  const colorCards = optionCards.filter(card => card.color === color)
  const otherColorCards = optionCards.filter(card => card.color !== color)
  const portfolioCount = portfolioCounts[state.input.playerCount]
  const portfolioColorCards = colorCards.slice(0, portfolioCount[color])
  if (portfolioColorCards.length < portfolioCount[color]) {
    const extraCount = portfolioCount[color] - portfolioColorCards.length
    const extraCards = otherColorCards.slice(0, extraCount)
    portfolioColorCards.push(...extraCards)
  }
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
