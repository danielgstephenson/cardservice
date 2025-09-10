import { Episode, Output } from '..'
import print from './print'

export default function printEpisodes (props: {
  start?: number
  end?: number
  output: Output
  playerId: string
}): void {
  const player = props.output.players.find(player => player.id === props.playerId)
  if (player == null) {
    throw new Error(`${props.playerId} not found`)
  }
  if (props.end == null || props.end > player.history.length) {
    const episode: Episode = {
      message: '--- End of history ---',
      children: [],
      time: Math.random(),
      id: Math.random().toString(36).substring(2, 15),
      firstInRound: false,
      round: Infinity
    }
    player.history.push(episode)
  }
  const start = props.start ?? 0
  const episodes = player.history.slice(start, props.end)
  print({ episodes })
}
