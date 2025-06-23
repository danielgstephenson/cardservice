import { Card } from '../card'
import { Episode } from '../episode'
import { Player } from '../player'

export class Powers {
  execute (card: Card, player: Player, parentEpiside: Episode, copy?: boolean): void {
    // Messages will vary between playing and copying
  }
}
