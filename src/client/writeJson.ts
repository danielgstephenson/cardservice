import fs from 'fs'

export default function writeJson (props: {
  data: unknown
  filename: string
}): void {
  const json = JSON.stringify(props.data, null, 2)
  fs.writeFileSync(props.filename, json)
}
