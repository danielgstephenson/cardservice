import { Input, Service } from '.'
import { getOutput } from './output'
import { State } from './state'

export const service: Service = (input: Input) => {
  const state = new State(input)
  return getOutput(state)
}
