export type Setup = {
  x: number
}

export type Episode = {
  x: number
}

export type Input = {
  setep: Setup
  episodes: Episode[]
}

export type Output = {
  x: number
}

export type Service = (input: Input) => Output