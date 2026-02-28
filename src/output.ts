import { Card } from './card'
import { Episode } from './episode'
import * as External from './external'
import { Output, Game } from './external'
import { unique } from './math'
import { Player } from './player'
import { State } from './state'

export function getOutput (state: State): Output {
  const players = [...Object.values(state.players)]
  return {
    players: players.map(player => getOutputPlayer(player)),
    game: getOutputGame(state)
  }
}

function getOutputPlayer (player: Player): External.Player {
  const outputHistory = getOutputEpisode(player.state.history, player).children
  return {
    id: player.id,
    name: player.name,
    gameId: player.gameId,
    history: outputHistory,
    playReady: player.playReady,
    withdrawn: player.withdrawn,
    auctionReady: player.auctionReady,
    bid: player.bid,
    hand: player.hand.array.map(card => getOutputCard(card)),
    deck: player.deck.array.map(card => getOutputCard(card)),
    play: player.playArea.array.map(card => getOutputCard(card)),
    trash: player.trashArea.array.map(card => getPrivateTrashCard(card)),
    majorMoney: player.majorMoney,
    minorMoney: player.minorMoney
  }
}

function getOutputProfile (player: Player): External.Profile {
  return {
    playerId: player.id,
    name: player.name,
    gameId: player.gameId,
    playReady: player.playReady,
    withdrawn: player.withdrawn,
    auctionReady: player.auctionReady,
    bid: player.bid,
    handCount: player.hand.size(),
    handPossible: player.hand.possible.map(card => getOutputCard(card)),
    deck: player.deck.array.map(card => getOutputCard(card)),
    play: player.playArea.array.map(card => getOutputCard(card)),
    trash: player.trashArea.array.map(card => getPublicTrashCard(card)),
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
    return episode.spectateMessage != null
  })
  const players = [...Object.values(state.players)]
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

function getOutputEpisode (episode: Episode, player?: Player): External.Episode {
  const message = player == null ? episode.spectateMessage : episode.messages[player.id]
  if (message == null) {
    throw new Error('getOutputEpisode: message == null')
  }
  const spectateChildren = episode.children.filter(child => child.spectateMessage != null)
  const playerChildren = episode.children.filter(child => {
    if (player == null) return false
    return child.messages[player.id] != null
  })
  const children = player == null ? spectateChildren : playerChildren
  const childIndices = [...children.keys()]
  const groupIds = unique(children.map(child => child.groupId).filter(id => id != null))
  groupIds.forEach(groupId => {
    if (player == null) return
    const indices = childIndices.filter(i => children[i].groupId === groupId)
    const sortedIndices = indices.toSorted((a, b) => {
      const idA = children[a].playerId
      const idB = children[b].playerId
      if (idA === player.id && idB !== player.id) {
        return -1
      }
      if (idA !== player.id && idB === player.id) {
        return 1
      }
      return 0
    })
    const sortedEpisodes = sortedIndices.map(i => children[i])
    sortedEpisodes.forEach((episode, i) => {
      children[indices[i]] = episode
    })
  })
  return {
    message,
    children: children.map(child => getOutputEpisode(child, player)),
    time: episode.time,
    id: episode.id,
    round: episode.round,
    firstInRound: episode.firstInRound,
    playerId: episode.playerId,
    groupId: episode.groupId
  }
}
