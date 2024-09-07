import { Input, Service } from './external'
import { getOutput } from './output'
import { State } from './state'

export const service: Service = (input: Input) => {
  const state = new State(input)
  return getOutput(state)
}
