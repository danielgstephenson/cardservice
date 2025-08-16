import { Player, Output } from '../external'

export default function getPlayer (output: Output, playerId: string): Player {
  const player = output.players.find(player => player.id === playerId)
  if (player == null) {
    throw new Error(`${playerId} not found in output1`)
  }
  return player
}
