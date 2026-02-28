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
    /*
    First, if the two leftmost ${names.center} ${cards.cards} are the same color, earn the higher rank.
      A: Only the ${names.empress} remains in the ${names.center}.
      B: Only the leftmost ${names.center} card, ${card.rank}, and the ${names.empress} remain in the ${names.center}, and the ${names.empress} has no color.
      C: The leftmost ${names.center} card, ${card.rank}, is ${card.color}, but the next leftmost ${names.center} card, ${nextCard.rank}, is {nextCard.color}.
      D: The two leftmost ${names.center} cards, ${card.rank} and ${nextCard.rank}, are both ${card.color}, so you earn ${nextCard.rank}.
        - (earn messages) use player.earn()
    */
    // WORK FROM HERE
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
