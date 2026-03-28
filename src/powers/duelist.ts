import { Card } from '../card'
import { Episode } from '../episode'
import { Player } from '../player'
import { addPlayedEpisodes } from './addPlayedEpisodes'
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
    // This still needs to be implemented.
  }

  power2 (card: Card, player: Player, parentEpisode: Episode): void {
    /*
    Second, you draw a number of cards equal to the most eyes on any played card.
      The most eyes on any played card is ${maxEyes}.
        - You played X with Y eyes.
        - p1 played X with Y eyes.
        ...
      A: (Nothing happens if maxEyes is zero)
      B: You draw ${maxEyes}.
        (draw events)
    */
    const names = card.state.input.names
    const privateMessage = `Second, you draw a number of ${names.cards} equal to the most eyes on any played ${names.card}.`
    const publicMessage = `Second, ${player.name} draws a number of ${names.cards} equal to the most ${names.charges} on any played ${names.card}.`
    const episode2 = parentEpisode.addYouChild(player, privateMessage, publicMessage)
    const playedCards = card.state.getPlayedCards()
    const maxEyes = Math.max(...playedCards.map(c => c.charge))
    const eyesEpisode = episode2.addPublicChild(`The most ${names.charges} on any played ${names.card} is ${maxEyes}.`)
    addPlayedEpisodes(eyesEpisode, player, { charge: true })
    if (maxEyes === 0) return
    const privateDrawMessage = `You draw ${maxEyes}.`
    const publicDrawMessage = `${player.name} draws ${maxEyes}.`
    const drawEpisode = episode2.addYouChild(player, privateDrawMessage, publicDrawMessage)
    player.draw(maxEyes, drawEpisode)
  }
}
