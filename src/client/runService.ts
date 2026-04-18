import { service } from '..'
import { Run, RunProps } from './clientTypes'
import printEpisodes from './printEpisodes'
import writeJson from './writeJson'

export default function runService (props: RunProps): Run {
  const eventful = 'events' in props
  if (props.debug === true) {
    const label = eventful
      ? props.events.length === 1
        ? 'take'
        : 'auction'
      : 'plan'
    const round = props.run.output?.game.round ?? 0
    console.debug(`Running ${props.label} (${label} ${round})...`)
  }
  const input = structuredClone(props.run.input)
  if (eventful) {
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
      if (props.debug === true) {
        console.debug(`${player.name}'s hand is ${player.hand.map(c => c.rank).join(', ')}`)
      }
      const playCard = player.hand[plan.play]
      const trashCard = player.hand[plan.trash]
      if (props.debug === true) {
        console.debug(`${player.name} plans to play ${playCard.rank} (${playCard.id})`)
        console.debug(`${player.name} plans to trash ${trashCard.rank} (${trashCard.id})`)
      }
      input.events.push({
        type: 'plan',
        playerId,
        playCard,
        trashCard
      })
    }
  }
  const start = props.start ?? 0
  const write = props.write ?? false
  const output = service(input)
  if (props.print === true) {
    console.debug(`Printing ${props.label}...`)
    printEpisodes({
      start,
      output,
      playerId: props.playerId
    })
  }
  if (write) {
    console.debug(`Writing ${props.label}...`)
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
    input,
    output
  }
}
