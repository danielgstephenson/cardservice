import { Card } from '../card'
import { Player } from '../player'
import { Powers } from './powers'

export class Thief extends Powers {
  execute (card: Card, player: Player): void {
    super.execute(card, player)
    const names = card.state.input.names
    const history = card.state.history
    let privateMessage1 = `First, if the ${names.highestRank} ${names.card} ${names.inPlay} is red or yellow, `
    let publicMessage1 = privateMessage1
    privateMessage1 += `earn 10 ${names.major}.`
    const privateEpisode = history.addPrivateChild(privateMessage1, [player], player.id)
    publicMessage1 += `${player.name} earns 10 ${names.major}.`
    const publicEpisode = history.addOthersChild(publicMessage1, [player], player.id)
    const colorMessage = `The highest rank ${names.card}, ${card.rank}, is ${card.color}.`
    privateEpisode.addPrivateChild(colorMessage, [player])
    publicEpisode.addPublicChild(colorMessage)
    if (['Red', 'Yellow'].includes(card.color)) {
      player.earn(10, privateEpisode, publicEpisode)
    }
  }
}
