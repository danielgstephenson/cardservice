import * as External from '../external'
import { State } from '../state'

export class TakeEventHandler {
  state: State

  constructor (state: State) {
    this.state = state
  }

  handle (event: External.TakeEvent): void {
    // RESUME HERE
  }
}
