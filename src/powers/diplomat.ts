import { Card } from '../card'
import { Episode } from '../episode'
import { Player } from '../player'
import { cardsToString } from '../translate'
import { Powers } from './powers'

export class Diplomat extends Powers {
  execute (card: Card, player: Player, parentEpisode: Episode): void {
    super.execute(card, player, parentEpisode)
    this.power1(card, player, parentEpisode)
    this.power2(card, player, parentEpisode)
  }

  power1 (card: Card, player: Player, parentEpisode: Episode): void {
    // THIS IS THE POWER FROM THE THEIF
    // UPDATE THIS TO THE CORRECT POWER FOR THE DIPLOMAT


    const names = card.state.input.names
    let privateMessage = `First, if the ${names.highestRank} ${names.card} ${names.inPlay} is red or yellow, `
    let publicMessage = privateMessage
    privateMessage += `earn 10 ${names.major}.`
    publicMessage += `${player.name} earns 10 ${names.major}.`
    const episode1 = parentEpisode.addYouChild(player, privateMessage, publicMessage)
    // Identify the highest rank card
    const colorMessage = `The highest rank ${names.card}, ${card.rank}, is ${card.color}.`
    episode1.addPublicChild(colorMessage)
    if (['Red', 'Yellow'].includes(card.color)) {
      player.earn(10, episode1)
    }
  }

  power2 (card: Card, player: Player, parentEpisode: Episode): void {
    const names = card.state.input.names
    const privateMessage = `Second, if your ${names.deck} is empty, you earn 20 ${names.major}.`
    let publicMessage = `Second, if ${player.name}'s ${names.deck} is empty,`
    publicMessage += ` they earn 20 ${names.major}.`
    const episode2 = parentEpisode.addYouChild(player, privateMessage, publicMessage)
    if (player.deck.array.length > 0) {
      const deck = cardsToString(player.deck.array)
      const privateMessage = `Your ${names.deck} is ${deck}.`
      const publicMessage = `${player.name}'s ${names.deck} is ${deck}.`
      episode2.addYouChild(player, privateMessage, publicMessage)
    } else {
      const privateMessage = `Your ${names.deck} is empty, so you earn 20 ${names.major}.`
      const publicMessage = `${player.name}'s ${names.deck} is empty, so they earn 20 ${names.major}.`
      episode2.addYouChild(player, privateMessage, publicMessage)
      player.earn(20, parentEpisode)
    }
  }
}
