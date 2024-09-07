import { Card } from './card'
import { Episode } from './episode'
import * as External from './external'
import { Output, Game } from './external'
import { Player } from './player'
import { State } from './state'

export function getOutput (state: State): Output {
  const players = [...state.players.values()]
  return {
    players: players.map(player => getOutputPlayer(player)),
    game: getOutputGame(state)
  }
}

function getOutputPlayer (player: Player): External.Player {
  const playerEpisodes = player.state.history.children.filter(episode => {
    return episode.viewers.includes(player)
  })
  return {
    id: player.id,
    userId: player.userId,
    name: player.name,
    gameId: player.gameId,
    history: playerEpisodes.map(episode => getOutputEpisode(episode)),
    playReady: player.playReady,
    withdrawn: player.withdrawn,
    auctionReady: player.auctionReady,
    playCard: player.playCard,
    trashCard: player.trashCard,
    bid: player.bid,
    hand: player.hand.array.map(card => getOutputCard(card)),
    reserve: player.reserve.array.map(card => getOutputCard(card)),
    inPlay: player.inPlay.array.map(card => getOutputCard(card)),
    trash: player.trash.array.map(card => getPrivateTrashCard(card)),
    majorMoney: player.majorMoney,
    minorMoney: player.minorMoney
  }
}

function getOutputProfile (player: Player): External.Profile {
  return {
    id: player.id,
    userId: player.userId,
    name: player.name,
    gameId: player.gameId,
    playReady: player.playReady,
    withdrawn: player.withdrawn,
    auctionReady: player.auctionReady,
    playCard: player.playCard,
    bid: player.bid,
    handCount: player.hand.size(),
    handPossible: [],
    reserve: player.reserve.array.map(card => getOutputCard(card)),
    inPlay: player.inPlay.array.map(card => getOutputCard(card)),
    trash: player.trash.array.map(card => getPublicTrashCard(card)),
    majorMoney: player.majorMoney,
    minorMoney: player.minorMoney
  }
}

function getOutputCard (card: Card): External.Card {
  return {
    id: card.id,
    rank: card.rank
  }
}

function getPrivateTrashCard (card: Card): External.PrivateTrashCard {
  if (card.trashRound == null) throw new Error('getPrivateTrashCard: card.trashRound == null')
  return {
    id: card.id,
    rank: card.rank,
    round: card.trashRound
  }
}

function getPublicTrashCard (card: Card): External.PublicTrashCard {
  if (card.trashRound == null) throw new Error('getPublicTrashCard: card.trashRound == null')
  return {
    round: card.trashRound
  }
}

function getOutputGame (state: State): Game {
  const publicEpisodes = state.history.children.filter(episode => {
    return !episode.private
  })
  const players = [...state.players.values()]
  return {
    startTime: state.startTime,
    history: publicEpisodes.map(episode => getOutputEpisode(episode)),
    profiles: players.map(player => getOutputProfile(player)),
    pendingChoices: [],
    market: state.market.array.map(card => getOutputCard(card)),
    archive: state.archive.array.map(card => getOutputCard(card)),
    center: state.center.array.map(card => getOutputCard(card)),
    round: state.round,
    phase: state.phase,
    extraMarket: state.extraMarket,
    playTied: state.playTied
  }
}

function getOutputEpisode (episode: Episode): External.Episode {
  return {
    message: episode.message,
    children: episode.children.map(child => getOutputEpisode(child)),
    time: episode.time,
    id: episode.id,
    round: episode.round,
    firstInRound: episode.firstInRound,
    playerId: episode.playerId
  }
}
