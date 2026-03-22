import { service } from '..'
import { Run, RunProps } from './clientTypes'
import printEpisodes from './printEpisodes'
import writeJson from './writeJson'

export default function runService(props: RunProps): Run {
  const input = structuredClone(props.run.input)
  if ('events' in props) {
    input.events.push(...props.events)
  } else {
    for (const player of input.players) {
      if (!(player.id in props.plans)) {
        throw new Error(`${player.id} has no plan`)
      }
    }
    for (const playerId in props.plans) {
      const plan = props.plans[playerId]
      const player = props.run.output.players.find(p => p.id === playerId)
      if (player == null) {
        throw new Error(`${playerId} is not playing`)
      }
      const playCard = player.hand[plan.play]
      const trashCard = player.hand[plan.trash]
      input.events.push({
        type: 'plan',
        playerId,
        playCard,
        trashCard
      })
    }
  }
  console.log(`Running ${props.label}...`)
  const start = props.start ?? 0
  const write = props.write ?? false
  const output = service(input)
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
      data: input,
      filename: 'input.json'
    })
    writeJson({
      data: output,
      filename: 'output.json'
    })
  }
  return {
    input: input,
    output,
  }
}
