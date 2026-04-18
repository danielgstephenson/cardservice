import { Input, InputEvent, Output } from '../external'

export interface Run {
  input: Input
  output: Output
}

export interface BaseProps {
  debug?: boolean
  run: Omit<Run, 'output'> & { output?: Output }
  label: string
  start?: number
  write?: boolean
}

export interface DontPrintProps {
  print?: undefined | false
  playerId?: undefined
}
export interface DoPrintProps {
  print: true
  playerId: string
}
export type PrintProps = DontPrintProps | DoPrintProps

export interface EventsChangeProps {
  events: InputEvent[]
}
export interface PlanCards {
  play: number
  trash: number
}
export interface PlanChangeProps {
  run: Run
  plans: Record<string, PlanCards>
}
export type ChangeProps = EventsChangeProps | PlanChangeProps

export type RunProps = BaseProps & PrintProps & ChangeProps
