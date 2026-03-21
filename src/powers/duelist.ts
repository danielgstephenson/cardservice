import { Card } from '../card'
import { Episode } from '../episode'
import { whichMax } from '../math'
import { Player } from '../player'
import { cardsToString } from '../translate'
import { Powers } from './powers'

export class Duelist extends Powers {
  execute (card: Card, player: Player, parentEpisode: Episode): void {
    super.execute(card, player, parentEpisode)
    this.power1(card, player, parentEpisode)
    this.power2(card, player, parentEpisode)
  }

  // These powers are not correct. They were just copied from the pirate. We still need to implement these powers.

  power1 (card: Card, player: Player, parentEpisode: Episode): void {
    /*
    First, if anyone ${names.played} a ${names.card} ranked lower than 9, you take one of your ${names.exiled} ${names.cards} into your hand.
      A: There are no ${names.played} ${names.cards} ranked lower than 9.
        You ${names.played} 9.
        Player 1 ${names.played} 9.
        ...
      B: ${lowestPlayer.name} ${names.played} ${lowestCard.rank}, so you take one of your ${names.exiled} ${names.cards} into your hand.
        You ${names.played} 9.
        Player 1 ${names.played} 9.
        ...
        (after exiled card is chosen events are added here)
    */
    const names = card.state.input.names
    let privateMessage = `First, if the ${names.highestRank} ${names.card} ${names.inPlay} is red or yellow, `
    let publicMessage = privateMessage
    privateMessage += `earn 10 ${names.major}.`
    publicMessage += `${player.name} earns 10 ${names.major}.`
    const episode1 = parentEpisode.addYouChild(player, privateMessage, publicMessage)
    const players = Object.values(player.state.players)
    const playedCards = players.map(p => p.playArea.array[0])
    const playedRanks = playedCards.map(card => card.rank)
    const highestRankCard = playedCards[whichMax(playedRanks)]
    const colorMessage = `The highest rank ${names.card}, ${highestRankCard.rank}, is ${highestRankCard.color.toLowerCase()}.`
    episode1.addPublicChild(colorMessage)
    if (['Red', 'Yellow'].includes(card.color)) {
      player.earn(10, episode1)
    }
  }

  power2 (card: Card, player: Player, parentEpisode: Episode): void {
    /*
    Second, you draw a number of cards equal to the most eyes on any played card.
    */

    const names = card.state.input.names
    const privateMessage = `Second, you put one ${names.joan} on the left side of your ${names.deck}. `
    const publicMessage = `Second, ${player.name} puts one ${names.joan} on the left side of their ${names.deck}.`
    const episode2 = parentEpisode.addYouChild(player, privateMessage, publicMessage)
    const privateOldDeck = `Your ${names.deck} was ${cardsToString(player.deck.array)}.`
    const publicOldDeck = `${player.name}'s ${names.deck} was ${cardsToString(player.deck.array)}.`
    episode2.addYouChild(player, privateOldDeck, publicOldDeck)
    const newCard = new Card(1, card.state)
    player.deck.add(newCard, true)
    const privateNewDeck = `Your ${names.deck} becomes ${cardsToString(player.deck.array)}.`
    const publicNewDeck = `${player.name}'s ${names.deck} becomes ${cardsToString(player.deck.array)}.`
    episode2.addYouChild(player, privateNewDeck, publicNewDeck)
  }
}
