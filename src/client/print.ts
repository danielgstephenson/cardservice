import { Episode } from '..'

export default function print (props: {
  depth?: number
  episodes: Array<Episode | undefined>
  path?: number[]
  notation?: boolean
}): void {
  const depth = props.depth ?? 0
  const notation = props.notation ?? false
  props.episodes.forEach((episode, index) => {
    if (episode == null) {
      console.info('--END OF HISTORY--')
      return
    }
    const path = props.path ?? []
    const newPath = [...path, index + 1]
    const joined = newPath.join('.')
    console.info(`${joined}. ${episode.message} ${notation && episode.groupId != null ? `[${episode.groupId}, ${episode.playerId ?? 'NO PLAYER'}]` : ''}`)
    print({
      depth: depth + 1,
      episodes: episode.children,
      path: newPath
    })
  })
}
