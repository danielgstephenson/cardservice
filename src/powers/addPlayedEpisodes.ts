import { Episode } from '../episode'
import { Player } from '../player'

// Implement the remaining cases for this function.

interface playedEpisodeOptions {
  charge?: boolean
  color?: boolean
}

export function addPlayedEpisodes (parentEpisode: Episode, youPlayer: Player, options: playedEpisodeOptions = {}): void {
  const groupId = crypto.randomUUID()
  const names = parentEpisode.state.input.names
  const players = Object.values(parentEpisode.state.players)
  const showCharge = options.charge ?? false
  const showColor = options.color ?? false
  // RANK
  if (!showColor && !showCharge) {
    players.forEach(player => {
      const card = player.playArea.array[0]
      if (card == null) throw new Error('addPlayedEpisodes: playCard == null')
      const privateMessage = `You ${names.played} ${card.rank}.`
      const publicMessage = `${player.name} ${names.played} ${card.rank}.`
      const rankEpisode = parentEpisode.addYouChild(
        player,
        privateMessage,
        publicMessage,
        player.id
      )
      rankEpisode.groupId = groupId
    })
  }
  // RANK AND CHARGE
  if (!showColor && showCharge) {
    players.forEach(player => {
      const card = player.playArea.array[0]
      if (card == null) throw new Error('addPlayedEpisodes: playCard == null')
      const privateMessage = `You ${names.played} ${card.rank}, which has ${card.charge} eyes.`
      const publicMessage = `${player.name} ${names.played} ${card.rank}, which has ${card.charge} eyes.`
      const rankEpisode = parentEpisode.addYouChild(
        player,
        privateMessage,
        publicMessage,
        player.id
      )
      rankEpisode.groupId = groupId
    })
  }
  // RANK AND COLOR
  if (showColor && !showCharge) {
    players.forEach(player => {
      const card = player.playArea.array[0]
      if (card == null) throw new Error('addPlayedEpisodes: playCard == null')
      const privateMessage = `You ${names.played} ${card.rank}, which is ${card.color.toLowerCase()}.`
      const publicMessage = `${player.name} ${names.played} ${card.rank}, which is ${card.color.toLowerCase()}.`
      const rankEpisode = parentEpisode.addYouChild(
        player,
        privateMessage,
        publicMessage,
        player.id
      )
      rankEpisode.groupId = groupId
    })
  }

  // RANK AND CHARGE AND COLOR (To be implemented)
}
