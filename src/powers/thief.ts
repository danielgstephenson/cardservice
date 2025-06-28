import { Card } from '../card'
import { Episode } from '../episode'
import { Player } from '../player'
import { cardsToString } from '../translate'
import { Powers } from './powers'

export class Thief extends Powers {
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
    const colorMessage = `The highest rank ${names.card}, ${card.rank}, is ${card.color}.`
    episode1.addPublicChild(colorMessage)
    if (['Red', 'Yellow'].includes(card.color)) {
      player.earn(10, episode1)
    }
  }

  power2 (card: Card, player: Player, parentEpisode: Episode): void {
    const names = card.state.input.names
    let privateMessage = `Second, you move the leftmost ${names.card} `
    privateMessage += `in your ${names.deck} to the right side.`
    let publicMessage = `Second, ${player.name} moves the leftmost ${names.card} `
    publicMessage += `in their ${names.deck} to the right side.`
    const episode2 = parentEpisode.addYouChild(player, privateMessage, publicMessage)
    const privateEmptyMessage = `Your ${names.deck} is empty.`
    const publicEmptyMessage = `${player.name}'s ${names.deck} is empty.`
    let privateOneMessage = `The leftmost ${names.card} in your deck is ${card.rank}, `
    privateOneMessage += 'but it is the only one.'
    let publicOneMessage = `The leftmost ${names.card} in ${player.name}'s deck is ${card.rank}, `
    publicOneMessage += 'but it is the only one.'
    const leftRank = player.deck.array[0].rank
    const privateLeftMessage = `The leftmost ${names.card} in your deck is ${leftRank}.`
    const publicLeftMessage = `The leftmost ${names.card} in ${player.name}'s deck is ${leftRank}.`
    const emptyDeck = player.deck.array.length === 0
    const oneCard = player.deck.array.length === 0
    const privateCardMessage = emptyDeck
      ? privateEmptyMessage
      : oneCard
        ? privateOneMessage
        : privateLeftMessage
    const publicCardMessage = emptyDeck
      ? publicEmptyMessage
      : oneCard
        ? publicOneMessage
        : publicLeftMessage
    episode2.addYouChild(player, privateCardMessage, publicCardMessage)
    if (player.deck.array.length < 2) return
    const privateOldDeck = `Your ${names.deck} was ${cardsToString(player.deck.array)}.`
    const publicOldDeck = `${player.name}'s ${names.deck} was ${cardsToString(player.deck.array)}.`
    episode2.addYouChild(player, privateOldDeck, publicOldDeck)
    const leftCard = player.deck.array.shift()
    if (leftCard == null) throw new Error('leftCard == null')
    player.deck.array.push(leftCard)
    const privateNewDeck = `Your ${names.deck} becomes ${cardsToString(player.deck.array)}.`
    const publicNewDeck = `${player.name}'s ${names.deck} becomes ${cardsToString(player.deck.array)}.`
    episode2.addYouChild(player, privateNewDeck, publicNewDeck)
  }
}
