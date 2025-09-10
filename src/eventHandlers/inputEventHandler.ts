import { State } from '../state'
import * as External from '..'
import { PlanEventHandler } from './planEventHandler'
import { BidEventHandler } from './bidEventHandler'
import { ConcedeEventHandler } from './concedeEventHandler'
import { TakeEventHandler } from './takeEventHandler'

export class InputEventHandler {
  state: State
  planEventHandler: PlanEventHandler
  bidEventHandler: BidEventHandler
  concedeEventHandler: ConcedeEventHandler
  takeEventHandler: TakeEventHandler

  constructor (state: State) {
    this.state = state
    this.planEventHandler = new PlanEventHandler(state)
    this.bidEventHandler = new BidEventHandler(state)
    this.concedeEventHandler = new ConcedeEventHandler(state)
    this.takeEventHandler = new TakeEventHandler(state)
  }

  handle (event: External.InputEvent): void {
    if (event.type === 'plan') {
      this.planEventHandler.handle(event)
    } if (event.type === 'bid') {
      this.bidEventHandler.handle(event)
    } if (event.type === 'concede') {
      this.concedeEventHandler.handle(event)
    } if (event.type === 'take') {
      this.takeEventHandler.handle(event)
    }
  }
}
