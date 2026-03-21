import { Episode } from '../episode'
import { Player } from '../player'

// Implement the remaining cases for this function.

export function addPlayedEpisodes (parentEpisode: Episode, youPlayer: Player): void {
  const groupId = crypto.randomUUID()
  const names = parentEpisode.state.input.names
  const players = Object.values(parentEpisode.state.players)
  // RANK ( To be implemented)
  // RANK AND CHARGE (To be implemented)
  // RANK AND COLOR
  players.forEach(player => {
    const card = player.playArea.array[0]
    if (card == null) throw new Error('pirate: playCard == null')
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
  // RANK AND CHARGE AND COLOR (To be implemented)
}
