import { Card } from '../card'
import { Player } from '../player'

export class Powers {
  execute (card: Card, player: Player): void {
    // const history = card.state.history
    // const privateMessage = `You play ${card.rank}.`
    // const privateEpisode = history.addPrivateChild(privateMessage, [player], player.id)
    // const publicMessage = `${player.name} plays ${card.rank}.`
    // const publicEpisode = history.addOthersChild(publicMessage, [player], player.id)

    // These message will vary between paying and copying
    // The head message will vary from case to case when coyping
    // The public and private episodes shouod be created elsewhere and passed to the powers class
  }
}
