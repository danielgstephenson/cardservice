import { Card } from '../card'
import { Episode } from '../episode'
import { Player } from '../player'
import { cardsToString } from '../translate'
import { Powers } from './powers'

export class Pirate extends Powers {
  execute (card: Card, player: Player, parentEpisode: Episode): void {
    super.execute(card, player, parentEpisode)
    this.power1(card, player, parentEpisode)
    this.power2(card, player, parentEpisode)
  }

  power1 (card: Card, player: Player, parentEpisode: Episode): void {
    const names = card.state.input.names
    let privateMessage = `First, if the ${names.highestRank} ${names.card} ${names.inPlay} is red or yellow, `
    let publicMessage = privateMessage
    privateMessage += `earn 10 ${names.major}.`
    publicMessage += `${player.name} earns 10 ${names.major}.`
    const episode1 = parentEpisode.addYouChild(player, privateMessage, publicMessage)
    // Identify the highest rank card
    const colorMessage = `The highest rank ${names.card}, ${card.rank}, is ${card.color.toLowerCase()}.`
    episode1.addPublicChild(colorMessage)
    if (['Red', 'Yellow'].includes(card.color)) {
      player.earn(10, episode1)
    }
  }

  power2 (card: Card, player: Player, parentEpisode: Episode): void {
    const names = card.state.input.names
    const privateMessage = `Second, you put one ${names.joan} on the left side of your ${names.deck}. `
    const publicMessage = `Second, ${player.name} puts one ${names.joan} on the left side of their ${names.deck}.`
    const episode2 = parentEpisode.addYouChild(player, privateMessage, publicMessage)
    const privateOldDeck = `Your ${names.deck} was ${cardsToString(player.deck.array)}.`
    const publicOldDeck = `${player.name}'s ${names.deck} was ${cardsToString(player.deck.array)}.`
    episode2.addYouChild(player, privateOldDeck, publicOldDeck)
    const newCard = new Card(1, card.state)
    player.deck.array.unshift(newCard)
    const privateNewDeck = `Your ${names.deck} becomes ${cardsToString(player.deck.array)}.`
    const publicNewDeck = `${player.name}'s ${names.deck} becomes ${cardsToString(player.deck.array)}.`
    episode2.addYouChild(player, privateNewDeck, publicNewDeck)
  }
}
