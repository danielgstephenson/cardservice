import { Card } from '../card'
import { Episode } from '../episode'
import { Player } from '../player'
import { cardsToString } from '../translate'
import { Powers } from './powers'

export class Princess extends Powers {
  execute (card: Card, player: Player, parentEpisode: Episode): void {
    super.execute(card, player, parentEpisode)
    this.power1(card, player, parentEpisode)
    this.power2(card, player, parentEpisode)
  }

  power1 (card: Card, player: Player, parentEpisode: Episode): void {
    const names = card.state.input.names
    const center = player.state.center
    const privateMessage = `First, if the two leftmost ${names.center} ${names.cards} are the same color, earn the higher rank.`
    const publicMessage = `First, if the two leftmost ${names.center} ${names.cards} are the same color, ${player.name} earns the higher rank.`
    const episode1 = parentEpisode.addYouChild(player, privateMessage, publicMessage)
    if (center.array.length === 0) {
      const childMessage = `Only the ${names.empress} remains in the ${names.center}.`
      episode1.addPublicChild(childMessage)
      return
    }
    const card0 = center.array[0]
    if (center.array.length === 1) {
      let childMessage = `Only the leftmost ${names.center} card, ${card0.rank}, `
      childMessage += `and the ${names.empress} remain in the ${names.center}, and the ${names.empress} has no color.`
      episode1.addPublicChild(childMessage)
      return
    }
    const card1 = center.array[1]
    if (card0.color !== card1.color) {
      let childMessage = `The leftmost ${names.center} card, ${card0.rank}, is ${card0.color}, `
      childMessage += `but the next leftmost ${names.center} card, ${card1.rank}, is ${card1.color}.`
      episode1.addPublicChild(childMessage)
      return
    }
    if (card0.color === card1.color) {
      let privateChildMessage = `The two leftmost ${names.center} cards, ${card0.rank} and ${card1.rank}, `
      let publicChildMessage = privateChildMessage
      privateChildMessage += `are both ${card0.color}, so you earn ${card1.rank}.`
      publicChildMessage += `are both ${card0.color}, so ${player.name} earns ${card1.rank}.`
      const childEpisode = episode1.addYouChild(player, privateChildMessage, publicChildMessage)
      player.earn(card1.rank, childEpisode)
    }
  }

  power2 (card: Card, player: Player, parentEpisode: Episode): void {
    const names = card.state.input.names
    const privateMessage = `Second, you swap the leftmost and rightmost ${names.cards} in your ${names.deck}.`
    const publicMessage = `Second, ${player.name} swaps the leftmost and rightmost ${names.cards} in their ${names.deck}.`
    const episode2 = parentEpisode.addYouChild(player, privateMessage, publicMessage)
    if (player.deck.array.length === 0) {
      const privateMessage = `Your ${names.deck} is empty.`
      const publicMessage = `${player.name}'s ${names.deck} is empty.`
      episode2.addYouChild(player, privateMessage, publicMessage)
      return
    }
    if (player.deck.array.length === 1) {
      const privateMessage = `Your ${names.deck} has only one ${names.card}, ${card.rank}.`
      const publicMessage = `${player.name}'s ${names.deck} has only one ${names.card}, ${card.rank}.`
      episode2.addYouChild(player, privateMessage, publicMessage)
      return
    }
    const privateOldDeck = `Your ${names.deck} was ${cardsToString(player.deck.array)}.`
    const publicOldDeck = `${player.name}'s ${names.deck} was ${cardsToString(player.deck.array)}.`
    episode2.addYouChild(player, privateOldDeck, publicOldDeck)
    const rightmost = player.deck.array.pop()
    const leftmost = player.deck.array.shift()
    if (rightmost == null) throw new Error('rightmost == null')
    if (leftmost == null) throw new Error('leftmost == null')
    player.deck.array.unshift(rightmost)
    player.deck.array.push(leftmost)
    const privateNewDeck = `Your ${names.deck} becomes ${cardsToString(player.deck.array)}.`
    const publicNewDeck = `${player.name}'s ${names.deck} becomes ${cardsToString(player.deck.array)}.`
    episode2.addYouChild(player, privateNewDeck, publicNewDeck)
  }
}
