import { Card } from '../card'
import { Choice } from '../choice'
import { Episode } from '../episode'
import { Player } from '../player'
import { Powers } from './powers'

export class Assassin extends Powers {
  episode2?: Episode

  execute (card: Card, player: Player, parentEpisode: Episode): void {
    super.execute(card, player, parentEpisode)
    this.power1(card, player, parentEpisode)
    this.power2(card, player, parentEpisode)
  }

  // These powers are not correct. They were just copied from the duelist. We still need to implement these powers.

  power1 (card: Card, player: Player, parentEpisode: Episode): void {
    const privateMessage = 'First, you earn 20 gold.'
    const publicMessage = `First, ${player.name} earns 20 gold.`
    const episode1 = parentEpisode.addYouChild(player, privateMessage, publicMessage)
    player.earn(20, episode1, true)
  }

  power2 (card: Card, player: Player, parentEpisode: Episode): void {
    const names = card.state.input.names
    const privateMessage = `Second, you choose one ${names.card} from your hand to ${names.trash}.`
    const publicMessage = `Second, ${player.name} chooses one ${names.card} from their hand to ${names.trash}.`
    this.episode2 = parentEpisode.addYouChild(player, privateMessage, publicMessage)
    const intend = (): void => {
      const privateMessage = 'Choose something.'
      const publicMessage = `${player.name} is choosing something.`
      card.state.history.addYouChild(player, privateMessage, publicMessage)
    }
    const fufill = (): void => {}
    const choice = new Choice(intend, fufill)
    card.state.choices.push(choice)
  }
}
