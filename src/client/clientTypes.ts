import { Input, Output, Player } from '../external'

export interface Run {
  input: Input
  output: Output
  players: Record<string, Player>
}
