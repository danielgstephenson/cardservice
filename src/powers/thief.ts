import { Card } from '../card'
import { Episode } from '../episode'
import { Player } from '../player'
import { Powers } from './powers'

export class Thief extends Powers {
  execute (card: Card, player: Player, parentEpisode: Episode, copy?: boolean): void {
    super.execute(card, player, parentEpisode)
    const names = card.state.input.names
    let privateMessage1 = `First, if the ${names.highestRank} ${names.card} ${names.inPlay} is red or yellow, `
    let publicMessage1 = privateMessage1
    privateMessage1 += `earn 10 ${names.major}.`
    publicMessage1 += `${player.name} earns 10 ${names.major}.`
    parentEpisode.addYouChild(player, privateMessage1, publicMessage1)
    const colorMessage = `The highest rank ${names.card}, ${card.rank}, is ${card.color}.`
    parentEpisode.addPublicChild(colorMessage)
    if (['Red', 'Yellow'].includes(card.color)) {
      player.earn(10, parentEpisode)
    }
  }
}
