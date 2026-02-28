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
    // The first power may trigger a choice.
    //   If there is no choice, do the second power.
    //   If there is a choice:
    //      Create the choice.
    //      When the ChooseExileEvent arrives:
    //        Resolve the choice
    //        Create a new top level episode for the choice.
    //        Carry out the second power.
    //        Attach the second power's episode to the choice episode.

    // THE PHANTOM MENACE (Episode I)
    // First, you take one of your {names.trashed} {names.cards} into your hand.
    // ? Your {names.trash} is empty
    //   (second power immediatedly)
    // : Your {names.trash} has only one card, {card.rank}
    // - Your hand was
    // - Your hand becomes
    //    (second power immediately)
    // : NO CHILDREN
    //    (second power delayed, do not put it here yet)

    // OTHER PLAYERS POWERS

    // ATTACK OF THE CLONES (Episode II)
    // You are choosing a {names.card} from your {names.trash} to take into your hand

    // NEW EVENT (ChooseExileEvent)

    // REVENGE OF THE SITH (Episode III)
    // ? You chose to take *1* from your {names.trash} into your hand
    // : {player.name} chose a {names.card} from their {names.trash} to take into their hand
    // - SECOND POWER

    // Add extra children for "your hand was/becomes"

    const names = card.state.input.names
    let privateMessage = `First, you take one of your ${names.trashed}`
    privateMessage += ` ${names.cards} into your hand.`
    let publicMessage = `First, ${player.name} takes one of`
    publicMessage += ` their ${names.trashed} ${names.cards} into their hand.`
    const episode1 = parentEpisode.addYouChild(player, privateMessage, publicMessage)
    if (player.trashArea.array.length === 0) {
      const privateMessage = `Your ${names.trash} is empty.`
      const publicMessage = `${player.name}'s ${names.trash} is empty.`
      episode1.addYouChild(player, privateMessage, publicMessage)
    } else if (player.trashArea.array.length === 1) {
      const trashCard = player.trashArea.array[0]
      const oldHandString = cardsToString(player.hand.array)
      player.hand.add(trashCard)
      const newHandString = cardsToString(player.hand.array)
      const oneMessage = `Your ${names.trash} has only one card, ${card.rank}.`
      episode1.addPrivateChild(player, oneMessage)
      const wasMessage = `Your hand was ${oldHandString}.`
      episode1.addPrivateChild(player, wasMessage)
      const becomeMessage = `Your hand becomes ${newHandString}.`
      episode1.addPrivateChild(player, becomeMessage)
    } else {
      // Choose a card from your trash to put in your hand
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
