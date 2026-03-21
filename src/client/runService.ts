import { service } from '..'
import { Input, InputEvent, Player } from '../external'
import { Run } from './clientTypes'
import printEpisodes from './printEpisodes'
import writeJson from './writeJson'

export default function runService (props: {
  events: InputEvent[]
  input: Input
  label: string
  start?: number
  write?: boolean
} & (
  { print?: undefined | false, playerId?: undefined } |
  { print: true, playerId: string }
)): Run {
  const clone = structuredClone(props.input)
  clone.events.push(...props.events)
  console.log(`Running ${props.label}...`)
  const start = props.start ?? 0
  const write = props.write ?? false
  const output = service(clone)
  if (props.print === true) {
    console.log(`Printing ${props.label}...`)
    printEpisodes({
      start,
      output,
      playerId: props.playerId
    })
  }
  if (write) {
    console.log(`Writing ${props.label}...`)
    writeJson({
      data: clone,
      filename: 'input.json'
    })
    writeJson({
      data: output,
      filename: 'output.json'
    })
  }
  const players: Record<string, Player> = {}
  for (const player of output.players) {
    players[player.id] = player
  }
  return {
    input: clone,
    output,
    players
  }
}
